import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TableViewAssetAction } from 'shared/table/actions/assets/table-view-asset-action';
import { DialogMode, SettingAuthorizationActions } from 'types/Authorization';

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
import {
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableEditType,
  TableFilterDef,
} from '../../../types/Table';
import { AssetConnectionDialogComponent } from './connection/asset-connection.dialog.component';
import { TableCheckAssetConnectionAction } from './table-actions/table-check-asset-connection-action';

@Injectable()
export class SettingsAssetConnectionEditableTableDataSource extends EditableTableDataSource<AssetConnectionSetting> {
  public authorizations: SettingAuthorizationActions;
  private editAction = new TableEditAction().getActionDef();
  private checkConnectionAction = new TableCheckAssetConnectionAction().getActionDef();
  private viewAction = new TableViewAssetAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService
  ) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<AssetConnectionSetting>> {
    // Not really editable datasource
    return new Observable((observer) => {
      if (this.editableRows) {
        this.addAction.visible = this.authorizations?.canUpdate;
        // Asset sort by name
        this.editableRows.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
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
      },
    ];
  }

  public buildTableDynamicRowActions(row: AssetConnectionSetting): TableActionDef[] {
    // Using global setting authorizations
    const rowActions: TableActionDef[] = [];
    // Update or View
    if (this.authorizations.canUpdate) {
      rowActions.push(this.editAction);
    } else {
      rowActions.push(this.viewAction);
    }
    // Check connection
    if (this.authorizations.canCheckAssetConnection) {
      rowActions.push(this.checkConnectionAction);
    }
    // Delete action
    if (this.authorizations.canUpdate) {
      rowActions.push(...super.buildTableRowActions());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.ADD:
        this.showAssetConnectionDialog(DialogMode.CREATE);
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, assetConnection: AssetConnectionSetting) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showAssetConnectionDialog(DialogMode.EDIT, assetConnection);
        break;
      case AssetButtonAction.CHECK_ASSET_CONNECTION:
        if (actionDef.action) {
          actionDef.action(
            assetConnection,
            this.formArray,
            this.dialogService,
            this.spinnerService,
            this.translateService,
            this.centralServerService,
            this.messageService,
            this.router
          );
        }
        break;
      case AssetButtonAction.VIEW_ASSET:
        this.showAssetConnectionDialog(DialogMode.VIEW, assetConnection);
        break;
      case ButtonAction.DELETE:
        this.dialogService
          .createAndShowYesNoDialog(
            this.translateService.instant('settings.asset.connection.delete_title'),
            this.translateService.instant('settings.asset.connection.delete_confirm', {
              assetConnectionName: assetConnection.name,
            })
          )
          .subscribe((result) => {
            if (result === ButtonAction.YES) {
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
    return [new TableRefreshAction().getActionDef()];
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
      refreshIntervalMins: 1,
      url: '',
    };
  }

  public setAuthorizations(authorizations: SettingAuthorizationActions) {
    this.authorizations = authorizations;
  }

  private showAssetConnectionDialog(
    dialogMode: DialogMode,
    assetConnection?: AssetConnectionSetting
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = { dialogData: assetConnection, dialogMode };
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((assetConnectionSetting: AssetConnectionSetting) => {
      if (assetConnectionSetting) {
        // Find object
        const index = this.editableRows.findIndex(
          (editableRow) => editableRow.id === assetConnectionSetting.id
        );
        if (index >= 0) {
          // Update
          this.editableRows.splice(index, 1, assetConnectionSetting);
        } else {
          // Create
          this.editableRows.push(assetConnectionSetting);
        }
        this.refreshData(false).subscribe();
        this.formArray.markAsDirty();
        this.tableChangedSubject.next(this.editableRows);
      }
    });
  }
}
