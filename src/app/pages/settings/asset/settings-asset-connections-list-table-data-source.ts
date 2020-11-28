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
import { AssetButtonAction } from '../../../types/Asset';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { AssetConnectionSetting, AssetConnectionType } from '../../../types/Setting';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableEditType, TableFilterDef } from '../../../types/Table';
import { AssetConnectionDialogComponent } from './connection/asset-connection.dialog.component';
import { TableCheckAssetConnectionAction } from './table-actions/table-check-asset-connection-action';

@Injectable()
export class SettingsAssetConnectionEditableTableDataSource extends EditableTableDataSource<AssetConnectionSetting> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService,
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
        // Asset sort by name
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
      new TableCheckAssetConnectionAction().getActionDef(),
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

  public rowActionTriggered(actionDef: TableActionDef, assetConnection: AssetConnectionSetting) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showAssetConnectionDialog(assetConnection);
        break;
      case AssetButtonAction.CHECK_ASSET_CONNECTION:
        if (actionDef.action) {
          actionDef.action(assetConnection, this.formArray, this.dialogService, this.spinnerService, this.translateService,
            this.centralServerService, this.messageService, this.router);
        }
        break;
      case ButtonAction.DELETE:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('settings.asset.connection.delete_title'),
          this.translateService.instant('settings.asset.connection.delete_confirm', { assetConnectionName: assetConnection.name }),
        ).subscribe((result) => {
          if (result === ButtonType.YES) {
            super.rowActionTriggered(actionDef, assetConnection);
          }
        });
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
      id: null,
      key: null,
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
    // Update
    if (assetConnection) {
      dialogConfig.data = assetConnection;
    // Create
    } else {
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
}
