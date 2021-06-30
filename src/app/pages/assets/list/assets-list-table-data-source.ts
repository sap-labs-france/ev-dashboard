import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ComponentService } from 'services/component.service';
import { SiteAreaTableFilter } from 'shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import TenantComponents from 'types/TenantComponents';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableCreateAssetAction, TableCreateAssetActionDef } from '../../../shared/table/actions/assets/table-create-asset-action';
import { TableDeleteAssetAction, TableDeleteAssetActionDef } from '../../../shared/table/actions/assets/table-delete-asset-action';
import { TableEditAssetAction, TableEditAssetActionDef } from '../../../shared/table/actions/assets/table-edit-asset-action';
import { TableRetrieveAssetConsumptionAction, TableRetrieveAssetConsumptionActionDef } from '../../../shared/table/actions/assets/table-retrieve-asset-consumption-action';
import { TableViewAssetAction, TableViewAssetActionDef } from '../../../shared/table/actions/assets/table-view-asset-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Asset, AssetButtonAction, AssetType } from '../../../types/Asset';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { AssetDialogComponent } from '../asset/asset.dialog.component';
import { AssetConsumptionCellComponent } from '../cell-components/asset-consumption-cell.component';
import { AssetConsumptionChartDetailComponent } from './consumption-chart/asset-consumption-chart-detail.component';

@Injectable()
export class AssetsListTableDataSource extends TableDataSource<Asset> {
  private isAdmin = false;
  private editAction = new TableEditAssetAction().getActionDef();
  private deleteAction = new TableDeleteAssetAction().getActionDef();
  private displayAction = new TableViewAssetAction().getActionDef();
  private retrieveConsumptionAction = new TableRetrieveAssetConsumptionAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private componentService: ComponentService,
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
    this.setStaticFilters([{ WithLogo: true, WithSiteArea: true }]);
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
            asset.image = Constants.NO_IMAGE;
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
      rowDetails: {
        enabled: true,
        showDetailsField: 'dynamicAsset',
        angularComponent: AssetConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'name',
        name: 'assets.name',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'dynamicAsset',
        name: 'assets.dynamic_asset',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (dynamicAsset: boolean) => dynamicAsset ?
          this.translateService.instant('general.yes') : this.translateService.instant('general.no'),
      },
      {
        id: 'assetType',
        name: 'assets.asset_type',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (assetType: AssetType) => {
          switch (assetType) {
            case AssetType.PRODUCTION:
              return this.translateService.instant('assets.produce');
            case AssetType.CONSUMPTION:
              return this.translateService.instant('assets.consume');
            case AssetType.CONSUMPTION_AND_PRODUCTION:
              return this.translateService.instant('assets.consume_and_produce');
          }
        }
      },
      {
        id: 'currentInstantWatts',
        name: 'assets.instant_power',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: false,
        isAngularComponent: true,
        angularComponent: AssetConsumptionCellComponent,
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        formatter: (currentStateOfCharge: number) => {
          if (!currentStateOfCharge) {
            return '-';
          }
          return `${currentStateOfCharge} %`;
        },
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAssetAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(asset: Asset): TableActionDef[] {
    const actions = [];
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsGPSCoordinates(asset.coordinates);
    if (this.isAdmin && asset.issuer) {
      actions.push(this.editAction);
      actions.push(new TableMoreAction([
        openInMaps,
        this.deleteAction,
      ]).getActionDef());
    } else {
      actions.push(this.displayAction);
      actions.push(openInMaps);
    }
    // Display refresh button
    if (this.isAdmin && asset.dynamicAsset && !asset.usesPushAPI) {
      actions.splice(1, 0, this.retrieveConsumptionAction);
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case AssetButtonAction.CREATE_ASSET:
        if (actionDef.action) {
          (actionDef as TableCreateAssetActionDef).action(AssetDialogComponent,
            this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, asset: Asset) {
    switch (actionDef.id) {
      case AssetButtonAction.VIEW_ASSET:
        if (actionDef.action) {
          (actionDef as TableViewAssetActionDef).action(AssetDialogComponent, this.dialog,
            { dialogData: asset }, this.refreshData.bind(this));
        }
        break;
      case AssetButtonAction.EDIT_ASSET:
        if (actionDef.action) {
          (actionDef as TableEditAssetActionDef).action(AssetDialogComponent, this.dialog,
            { dialogData: asset }, this.refreshData.bind(this));
        }
        break;
      case AssetButtonAction.DELETE_ASSET:
        if (actionDef.action) {
          (actionDef as TableDeleteAssetActionDef).action(asset, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case AssetButtonAction.RETRIEVE_ASSET_CONSUMPTION:
        if (actionDef.action) {
          (actionDef as TableRetrieveAssetConsumptionActionDef).action(asset, this.spinnerService, this.centralServerService,
            this.messageService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(asset.coordinates);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const issuerFilter = new IssuerFilter().getFilterDef();
    const filters: TableFilterDef[] = [
      issuerFilter,
    ];
    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
      filters.push(siteFilter);
      filters.push(new SiteAreaTableFilter([issuerFilter, siteFilter]).getFilterDef());
    }
    return filters;
  }
}
