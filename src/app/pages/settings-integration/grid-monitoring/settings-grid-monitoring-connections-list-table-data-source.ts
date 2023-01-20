import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { Utils } from 'utils/Utils';

import { DialogService } from '../../../services/dialog.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableCheckConnectionAction } from '../../../shared/table/actions/table-check-connection-action';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../types/GlobalType';
import { GridMonitoringConnectionSetting, GridMonitoringConnectionType } from '../../../types/Setting';
import { TableActionDef, TableColumnDef, TableDef, TableEditType, TableFilterDef } from '../../../types/Table';
import { GridMonitoringConnectionDialogComponent } from './connection/grid-monitoring-connection.dialog.component';

@Injectable()
export class SettingsGridMonitoringConnectionEditableTableDataSource extends EditableTableDataSource<GridMonitoringConnectionSetting> {
  private editAction: TableEditAction;
  private checkConnectionAction: TableCheckConnectionAction;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<GridMonitoringConnectionSetting>> {
    // Not really editable datasource
    return new Observable((observer) => {
      if (this.editableRows) {
        if (this.checkConnectionAction) {
          this.checkConnectionAction.getActionDef().disabled = false;
        }
        // grid monitoring connection sort by name
        this.editableRows.sort((a, b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0);
        observer.next({
          count: this.editableRows.length,
          result: this.editableRows,
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
      }
      observer.complete();
    });
  }

  public buildTableDef(): TableDef {
    return {
      id: 'SettingsGridMonitoringConnectorsEditableTableDataSource',
      isEditable: false,
      rowFieldNameIdentifier: 'id',
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'Name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        editType: TableEditType.DISPLAY_ONLY,
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
      {
        id: 'description',
        name: 'Description',
        headerClass: 'col-40p',
        class: 'col-40p',
        editType: TableEditType.DISPLAY_ONLY,
        sortable: false,
      },
      {
        id: 'type',
        name: 'Type',
        formatter: (type: string) => this.translateService.instant(`settings.grid_monitoring.types.${type.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase())}`),
        headerClass: 'col-30p',
        class: 'col-30p',
        editType: TableEditType.DISPLAY_ONLY,
        sortable: false,
      }
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    if (!this.editAction) {
      this.editAction = new TableEditAction();
    }
    if (!this.checkConnectionAction) {
      this.checkConnectionAction = new TableCheckConnectionAction();
    }
    return [
      this.editAction.getActionDef(),
      this.checkConnectionAction.getActionDef(),
      ...super.buildTableRowActions()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.ADD:
        this.showGridMonitoringConnectionDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, gridMonitoringConnection: GridMonitoringConnectionSetting) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showGridMonitoringConnectionDialog(gridMonitoringConnection);
        break;
      case ButtonAction.TEST_CONNECTION:
        this.checkGridMonitoringConnection(gridMonitoringConnection.id);
        break;
      case ButtonAction.DELETE:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('settings.grid_monitoring.connection.delete_title'),
          this.translateService.instant('settings.grid_monitoring.connection.delete_confirm', { gridMonitoringConnectionName: gridMonitoringConnection.name }),
        ).subscribe((result) => {
          if (result === ButtonAction.YES) {
            super.rowActionTriggered(actionDef, gridMonitoringConnection);
          }
        });
        break;
      default:
        super.rowActionTriggered(actionDef, gridMonitoringConnection);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public createRow(): GridMonitoringConnectionSetting {
    return {
      id: null,
      key: null,
      name: '',
      description: '',
      type: GridMonitoringConnectionType.NONE,
    };
  }

  private showGridMonitoringConnectionDialog(gridMonitoringConnection?: GridMonitoringConnectionSetting) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Update
    if (gridMonitoringConnection) {
      dialogConfig.data = gridMonitoringConnection;
    // Create
    } else {
      dialogConfig.data = this.createRow();
    }
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(GridMonitoringConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((gridMonitoringConnectionSetting: GridMonitoringConnectionSetting) => {
      if (gridMonitoringConnectionSetting) {
        // Find object
        const index = this.editableRows.findIndex(
          (editableRow) => editableRow.id === gridMonitoringConnectionSetting.id);
        if (index >= 0) {
          // Update
          this.editableRows.splice(index, 1, gridMonitoringConnectionSetting);
        } else {
          // Create
          this.editableRows.push(gridMonitoringConnectionSetting);
        }
        this.refreshData(false).subscribe();
        this.formArray.markAsDirty();
        this.tableChangedSubject.next(this.editableRows);
        this.checkConnectionAction.getActionDef().disabled = this.formArray.dirty;
      }
    });
  }

  private checkGridMonitoringConnection(gridMonitoringId: string) {
    this.spinnerService.show();
    this.centralServerService.checkGridMonitoringConnection(gridMonitoringId).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('settings.grid_monitoring.connection_success');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'settings.grid_monitoring.connection_error');
      }
    });
  }
}
