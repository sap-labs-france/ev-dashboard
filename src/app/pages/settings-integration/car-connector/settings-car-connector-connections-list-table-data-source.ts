import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { CarConnectorConnectionSetting, CarConnectorConnectionType, CarConnectorSetting, CarConnectorSettings } from '../../../types/Setting';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableEditType, TableFilterDef } from '../../../types/Table';
import { CarConnectorConnectionDialogComponent } from './connection/car-connector-connection.dialog.component';

@Injectable()
export class SettingsCarConnectorConnectionEditableTableDataSource extends EditableTableDataSource<CarConnectorConnectionSetting> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<CarConnectorConnectionSetting>> {
    // Not really editable datasource
    return new Observable((observer) => {
      // Check
      if (this.editableRows) {
        // Car connector sort by name
        this.editableRows.sort((a, b) => {
          return (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0;
        });
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
      id: 'SettingsCarConnectorConnectorsEditableTableDataSource',
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
        formatter: (type: string) => this.translateService.instant(`settings.car_connector.types.${type}`),
        headerClass: 'col-30p',
        class: 'col-30p',
        editType: TableEditType.DISPLAY_ONLY,
        sortable: false,
      }
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      new TableEditAction().getActionDef(),
      ...super.buildTableRowActions()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.ADD:
        this.showCarConnectorConnectionDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, carConnectorConnection: CarConnectorConnectionSetting) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showCarConnectorConnectionDialog(carConnectorConnection);
        break;
      case ButtonAction.DELETE:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('settings.car_connector.connection.delete_title'),
          this.translateService.instant('settings.car_connector.connection.delete_confirm', { carConnectorConnectionName: carConnectorConnection.name }),
        ).subscribe((result) => {
          if (result === ButtonType.YES) {
            super.rowActionTriggered(actionDef, carConnectorConnection);
          }
        });
        break;
      default:
        super.rowActionTriggered(actionDef, carConnectorConnection);
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

  public createRow(): CarConnectorConnectionSetting {
    return {
      id: null,
      key: null,
      name: '',
      description: '',
      type: CarConnectorConnectionType.NONE,
    };
  }

  private showCarConnectorConnectionDialog(carConnectorConnection?: CarConnectorConnectionSetting) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Update
    if (carConnectorConnection) {
      dialogConfig.data = carConnectorConnection;
    // Create
    } else {
      dialogConfig.data = this.createRow();
    }
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(CarConnectorConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((carConnectorConnection: CarConnectorConnectionSetting) => {
      if (carConnectorConnection) {
        // Find object
        const index = this.editableRows.findIndex(
          (editableRow) => editableRow.id === carConnectorConnection.id);
        if (index >= 0) {
          // Update
          this.editableRows.splice(index, 1, carConnectorConnection);
        } else {
          // Create
          this.editableRows.push(carConnectorConnection);
        }
        this.refreshData(false).subscribe();
        this.formArray.markAsDirty();
        this.tableChangedSubject.next(this.editableRows);
      }
    });
  }
}
