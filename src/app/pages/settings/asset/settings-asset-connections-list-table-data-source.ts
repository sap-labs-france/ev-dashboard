import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { EditableTableDataSource } from 'app/shared/table/editable-table-data-source';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { AssetConnectionSetting } from 'app/types/Setting';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef, TableEditType } from 'app/types/Table';
import { Observable } from 'rxjs';
import { AssetConnectionDialogComponent } from './connection/asset-connection.dialog.component';

@Injectable()
export class SettingsAssetConnectionEditableTableDataSource extends EditableTableDataSource<AssetConnectionSetting> {
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialogService: DialogService,
    private dialog: MatDialog) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<AssetConnectionSetting>> {
    return new Observable((observer) => {
      // Check
      if (this.editableRows) {
        this.editableRows.sort((a, b) => {
          return (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0;
        });
        const assetConnections = [];
        for (let index = 0; index < this.editableRows.length; index++) {
          const assetConnection = this.editableRows[index];
          assetConnection.id = index;
          assetConnections.push(assetConnection);
        }
        observer.next({
          count: assetConnections.length,
          result: assetConnections,
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
      this.editAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.ADD:
        this.showAssetConnectionDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, assetConnection: AssetConnectionSetting, ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showAssetConnectionDialog(assetConnection);
        break;
      case ButtonAction.DELETE:
        this.deleteAssetConnection(assetConnection);
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
      id: 0,
      key: '',
      name: '',
      description: '',
      type: '',
      url: ''
    };
  }

  private showAssetConnectionDialog(assetConnection?: AssetConnectionSetting) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = assetConnection;
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((newAssetConnection: AssetConnectionSetting) => {
      if (newAssetConnection) {
        // Create
        if (!newAssetConnection.id) {
          newAssetConnection.id = this.editableRows.length;
          this.editableRows.push(newAssetConnection);
        // Update
        } else {
          // Find object
          const index = this.editableRows.findIndex(
            (editableRow) => editableRow.id === newAssetConnection.id);
          this.editableRows.splice(index, 1, newAssetConnection);
        }
        this.formArray.markAsDirty();
        this.refreshData(false).subscribe();
        this.tableChangedSubject.next(this.editableRows);
      }
    });
  }

  private deleteAssetConnection(assetConnection: AssetConnectionSetting) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.asset.connection.delete_title'),
      this.translateService.instant('settings.asset.connection.delete_confirm', { assetConnectionName: assetConnection.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        const index = this.editableRows.findIndex((elem) => elem.id === assetConnection.id);
        if (index > -1) {
          this.editableRows.splice(index, 1);
        }
        if (this.formArray) {
          this.formArray.markAsDirty();
        }
        this.refreshData(false).subscribe();
        this.tableChangedSubject.next(this.editableRows);
      }
    });
  }
}
