import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Asset, AssetImage } from 'app/types/Asset';
import ChangeNotification from 'app/types/ChangeNotification';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { AssetDialogComponent } from '../asset/asset.dialog.component';

@Injectable()
export class AssetsListTableDataSource extends TableDataSource<Asset> {
  private isAdmin = false;
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.setStaticFilters([{WithLogo: true, WithSiteArea: true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectAssets();
  }

  public loadDataImpl(): Observable<DataResult<Asset>> {
    return new Observable((observer) => {
      // get assets
      this.centralServerService.getAssets(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((assets) => {
        // lookup for image otherwise assign default
        for (const asset of assets.result) {
          if (!asset.image) {
            asset.image = AssetImage.NO_IMAGE;
          }
        }
        // Ok
        observer.next(assets);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'name',
        name: 'assets.name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(asset: Asset) {
    const actions = [];
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(asset.address);
    if (this.isAdmin) {
      actions.push(this.editAction);
      actions.push(new TableMoreAction([
        openInMaps,
        this.deleteAction,
      ]).getActionDef());
    } else {
      actions.push(this.viewAction);
      actions.push(openInMaps);
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showAssetDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Asset) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showAssetDialog(rowItem);
        break;
      case ButtonAction.DELETE:
        this.deleteAsset(rowItem);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        this.showPlace(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
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

  private showAssetDialog(asset?: Asset) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (asset) {
      dialogConfig.data = asset.id;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showPlace(asset: Asset) {
    if (asset && asset.address && asset.address.coordinates) {
      window.open(`http://maps.google.com/maps?q=${asset.address.coordinates[1]},${asset.address.coordinates[0]}`);
    }
  }

  private deleteAsset(asset: Asset) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('assets.delete_title'),
      this.translateService.instant('assets.delete_confirm', {assetName: asset.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteAsset(asset.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('assets.delete_success', {assetName: asset.name});
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'assets.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'assets.delete_error');
        });
      }
    });
  }
}
