import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableTestConnectionAction } from 'app/shared/table/actions/table-test-connection-action';
import { EditableTableDataSource } from 'app/shared/table/editable-table-data-source';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { AssetConnectionSetting, AssetConnectionType } from 'app/types/Setting';
import { TableActionDef, TableColumnDef, TableDef, TableEditType, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { NOT_FOUND, PRECONDITION_FAILED, UNAUTHORIZED } from 'http-status-codes';
import { Observable } from 'rxjs';
import { AssetConnectionDialogComponent } from './connection/asset-connection.dialog.component';


@Injectable()
export class SettingsAssetConnectionEditableTableDataSource extends EditableTableDataSource<AssetConnectionSetting> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<AssetConnectionSetting>> {
    // Not really editable datasource
    return new Observable((observer) => {
      // Check
      if (this.editableRows) {
        // Asset sort alpha by replacing indexes
        this.editableRows.sort((a, b) => {
          return (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0;
        });
        const assetConnections = [];
        for (let index = 0; index < this.editableRows.length; index++) {
          const assetConnection = this.editableRows[index];
          assetConnection.id = index.toString();
          assetConnections.push(assetConnection);
        }
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
      id: 'SettingsAssetConnectionEditableTableDataSource',
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
        formatter: (type: string) => this.translateService.instant(`settings.asset.types.${type}`),
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
      new TableTestConnectionAction().getActionDef(),
      ...super.buildTableRowActions()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.ADD:
        this.showAssetConnectionDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, assetConnection: AssetConnectionSetting, ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showAssetConnectionDialog(assetConnection);
        break;
      case ButtonAction.TEST_CONNECTION:
        this.testConnectionAction(assetConnection);
        break;
      default:
        super.rowActionTriggered(actionDef, assetConnection);
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

  public createRow(): AssetConnectionSetting {
    return {
      id: '',
      key: '',
      name: '',
      description: '',
      type: AssetConnectionType.NONE,
      url: ''
    };
  }

  private showAssetConnectionDialog(assetConnection?: AssetConnectionSetting) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (assetConnection) {
      // Update
      dialogConfig.data = assetConnection;
    } else {
      // Create
      dialogConfig.data = this.createRow();
    }
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((assetConnection: AssetConnectionSetting) => {
      if (assetConnection) {
        // Find object
        const index = this.editableRows.findIndex(
          (editableRow) => editableRow.id === assetConnection.id);
        if (index >= 0) {
          // Update
          this.editableRows.splice(index, 1, assetConnection);
        } else {
          // Create
          this.editableRows.push(assetConnection);
        }
        this.refreshData(false).subscribe();
        this.formArray.markAsDirty();
        this.tableChangedSubject.next(this.editableRows);
      }
    });
  }

  public testConnectionAction(assetConnection: AssetConnectionSetting) {
    this.spinnerService.show();
    this.centralServerService.assetTestConnection(assetConnection).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('settings.asset.connection_success');
      } else {
        let statusMessage = 'settings.asset.connection_failed';
        switch (response.statusCode) {
          case UNAUTHORIZED:
            statusMessage = 'settings.asset.unauthorized';
            break;
          case NOT_FOUND:
            statusMessage = 'settings.asset.not_found';
            break;
          case PRECONDITION_FAILED:
            statusMessage = 'settings.asset.invalid_response';
            break;
          default:
            statusMessage = 'settings.asset.connection_failed';
            break;
        }
        Utils.handleError(JSON.stringify(response), this.messageService, statusMessage);
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'settings.asset.connection_failed');
    });
  }
}
