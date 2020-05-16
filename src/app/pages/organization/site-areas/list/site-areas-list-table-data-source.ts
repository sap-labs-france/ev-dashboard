import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableExportOCPPParamsAction } from 'app/pages/charging-stations/table-actions/table-export-ocpp-params-action';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService } from 'app/services/component.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Action, Entity } from 'app/types/Authorization';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import ChangeNotification from '../../../../types/ChangeNotification';
import { TableAssignAssetsToSiteAreaAction } from '../table-actions/table-assign-assets-to-site-area-action';
import { TableAssignChargingStationsToSiteAreaAction } from '../table-actions/table-assign-charging-stations-to-site-area-action';
import { TableViewAssignedAssetsOfSiteAreaAction } from '../table-actions/table-assign-view-assets-of-site-area-action';
import { TableCreateSiteAreaAction } from '../table-actions/table-create-site-area-action';
import { TableDeleteSiteAreaAction } from '../table-actions/table-delete-site-area-action';
import { TableEditSiteAreaAction } from '../table-actions/table-edit-site-area-action';
import { TableViewChargingStationsOfSiteAreaAction } from '../table-actions/table-view-charging-stations-of-site-area-action';
import { TableViewSiteAreaAction } from '../table-actions/table-view-site-area-action';
import { SiteAreaConsumptionChartDetailComponent } from './consumption-chart/site-area-consumption-chart-detail.component';

@Injectable()
export class SiteAreasListTableDataSource extends TableDataSource<SiteArea> {
  private readonly isAssetComponentActive: boolean;
  private editAction = new TableEditSiteAreaAction().getActionDef();
  private assignChargingStationsToSiteAreaAction = new TableAssignChargingStationsToSiteAreaAction().getActionDef();
  private assignAssetsToSiteAreaAction = new TableAssignAssetsToSiteAreaAction().getActionDef();
  private deleteAction = new TableDeleteSiteAreaAction().getActionDef();
  private viewAction = new TableViewSiteAreaAction().getActionDef();
  private viewChargingStationsOfSiteArea = new TableViewChargingStationsOfSiteAreaAction().getActionDef();
  private viewAssetsOfSiteArea = new TableViewAssignedAssetsOfSiteAreaAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();

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
    private componentService: ComponentService) {
    super(spinnerService, translateService);
    // Init
    this.isAssetComponentActive = this.componentService.isActive(TenantComponents.ASSET);
    this.setStaticFilters([{ WithSite: true }]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectSiteAreas();
  }

  public loadDataImpl(): Observable<DataResult<SiteArea>> {
    return new Observable((observer) => {
      // Get Site Areas
      this.centralServerService.getSiteAreas(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Ok
          observer.next(siteAreas);
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
        angularComponent: SiteAreaConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'name',
        name: 'site_areas.title',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site.name',
        name: 'sites.site',
        headerClass: 'col-30p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canAccess(Entity.SITE_AREA, Action.CREATE)) {
      return [
        new TableCreateSiteAreaAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(siteArea: SiteArea): TableActionDef[] {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    let actions: TableActionDef[];
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(siteArea.address);
    if (this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(siteArea.siteID)) {
      actions = [
        this.editAction,
        this.authorizationService.isAdmin() ? this.assignChargingStationsToSiteAreaAction : this.viewChargingStationsOfSiteArea,
        new TableMoreAction([
          this.exportOCPPParamsAction,
          openInMaps,
          this.deleteAction,
        ]).getActionDef(),
      ];
      if (this.isAssetComponentActive) {
        actions.splice(2, 0, this.assignAssetsToSiteAreaAction);
      }
    } else {
      actions = [
        this.viewAction,
        this.viewChargingStationsOfSiteArea,
        new TableMoreAction([
          openInMaps,
        ]).getActionDef(),
      ];
      if (this.isAssetComponentActive) {
        actions.splice(2, 0, this.viewAssetsOfSiteArea);
      }
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case SiteAreaButtonAction.CREATE_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, siteArea: SiteArea) {
    switch (actionDef.id) {
      case SiteAreaButtonAction.EDIT_SITE_AREA:
      case SiteAreaButtonAction.VIEW_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA:
      case SiteAreaButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.DELETE_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(siteArea, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(siteArea.address.coordinates);
        }
        break;
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        if (actionDef.action) {
          actionDef.action({ siteArea }, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService
          );
        }
        break;
      case SiteAreaButtonAction.ASSIGN_ASSETS_TO_SITE_AREA:
      case SiteAreaButtonAction.VIEW_ASSETS_OF_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
      new SiteTableFilter().getFilterDef(),
    ];
  }
}
