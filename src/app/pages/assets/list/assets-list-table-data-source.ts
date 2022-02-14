import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SiteAreaTableFilter } from 'shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';

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
import { AssetDataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { AssetDialogComponent } from '../asset/asset-dialog.component';
import { AssetConsumptionCellComponent } from '../cell-components/asset-consumption-cell.component';
import { AssetConsumptionChartDetailComponent } from './consumption-chart/asset-consumption-chart-detail.component';

@Injectable()
export class AssetsListTableDataSource extends TableDataSource<Asset> {
  private canCreate = new TableCreateAssetAction().getActionDef();
  private editAction = new TableEditAssetAction().getActionDef();
  private deleteAction = new TableDeleteAssetAction().getActionDef();
  private displayAction = new TableViewAssetAction().getActionDef();
  private retrieveConsumptionAction = new TableRetrieveAssetConsumptionAction().getActionDef();
  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
  ) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([{
      WithSite: true,
      WithSiteArea: true
    }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<AssetDataResult> {
    return new Observable((observer) => {
      // get assets
      this.centralServerService.getAssets(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((assets) => {
        // lookup for image otherwise assign default
        for (const asset of assets.result) {
          if (!asset.image) {
            asset.image = Constants.NO_IMAGE;
          }
        }
        // Asset auth
        this.canCreate.visible = Utils.convertToBoolean(assets.canCreate);
        // Specific filter authorizations not part of Asset
        this.siteFilter.visible = Utils.convertToBoolean(assets.canListSites);
        this.siteAreaFilter.visible = Utils.convertToBoolean(assets.canListSiteAreas);
        observer.next(assets);
        observer.complete();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
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
        showDetailsField: 'canReadConsumption',
        angularComponent: AssetConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'id',
        name: 'general.id',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        direction: 'asc',
      },
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
        id: 'site.name',
        name: 'sites.title',
        headerClass: 'col-20p',
        class: 'col-20p',
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
        formatter: (dynamicAsset: boolean) => Utils.displayYesNo(this.translateService, dynamicAsset),
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
    return [
      this.canCreate,
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(asset: Asset): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    const moreActions = new TableMoreAction([]);
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsGPSCoordinates(asset.coordinates);
    // Edit button
    if(asset.canUpdate) {
      rowActions.push(this.editAction);
    // Show button
    } else if (asset.canRead) {
      rowActions.push(this.displayAction);
    }
    // Display refresh button
    if (asset.canRetrieveConsumption) {
      rowActions.push(this.retrieveConsumptionAction);
    }
    // More action
    if(asset.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      moreActions.addActionInMoreActions(openInMaps);
      rowActions.push(moreActions.getActionDef());
    } else {
      // More action is empty we put actions directly in row
      rowActions.push(openInMaps);
    }
    return rowActions;
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
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([this.issuerFilter, this.siteFilter]).getFilterDef();
    // Filter visibility will be defined by auth
    this.siteFilter.visible = false;
    this.siteAreaFilter.visible = false;
    // Create filters
    const filters: TableFilterDef[] = [
      this.issuerFilter,
      this.siteFilter,
      this.siteAreaFilter
    ];
    return filters;
  }
}
