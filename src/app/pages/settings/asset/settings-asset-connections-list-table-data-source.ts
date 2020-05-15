import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { AssetConnectionSetting } from 'app/types/Setting';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { AssetConnectionDialogComponent } from './connection/asset-connection.dialog.component';

@Injectable()
export class SettingsAssetConnectionListTableDataSource extends TableDataSource<AssetConnectionSetting> {
  public changed = new EventEmitter<boolean>();
  private assetConnections!: AssetConnectionSetting[];
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

  public setAssetConnections(assetConnections: AssetConnectionSetting[]) {
    this.assetConnections = assetConnections ? assetConnections : [];
  }

  public getAssetConnections(): AssetConnectionSetting[] {
    return this.assetConnections;
  }

  public loadDataImpl(): Observable<DataResult<AssetConnectionSetting>> {
    return new Observable((observer) => {
      // Check
      if (this.assetConnections) {
        this.assetConnections.sort((a, b) => {
          return (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0;
        });
        const assetConnections = [];
        for (let index = 0; index < this.assetConnections.length; index++) {
          const assetConnection = this.assetConnections[index];
          assetConnection.id = index.toString();
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
      search: {
        enabled: false,
      },
      design: {
        flat: true,
      },
      footer: {
        enabled: false,
      },
      rowFieldNameIdentifier: 'url',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'Name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
      {
        id: 'description',
        name: 'Description',
        headerClass: 'col-40p',
        class: 'col-40p',
        sortable: false,
      },
      {
        id: 'type',
        name: 'Type',
        formatter: (type: string) => this.translateService.instant(`settings.asset.types.${type}`),
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false,
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef,
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
      case ButtonAction.CREATE:
        this.showAssetConnectionDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, assetConnection: AssetConnectionSetting) {
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

  private showAssetConnectionDialog(assetConnection?: AssetConnectionSetting) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (assetConnection) {
      dialogConfig.data = assetConnection;
    }
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetConnectionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Find object
        const index = this.assetConnections.findIndex((assetConnection) => assetConnection.id === result.id);
        if (index >= 0) {
          this.assetConnections.splice(index, 1, result);
        } else {
          this.assetConnections.push(result);
        }
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private deleteAssetConnection(assetConnection: AssetConnectionSetting) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.asset.connection.delete_title'),
      this.translateService.instant('settings.asset.connection.delete_confirm', { assetConnectionName: assetConnection.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        const index = this.assetConnections.findIndex((link) => link.id === assetConnection.id);
        if (index > -1) {
          this.assetConnections.splice(index, 1);
        }
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }
}
