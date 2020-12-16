import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { TableSiteAreaGenerateQrCodeConnectorAction, TableSiteAreaGenerateQrCodeConnectorsActionDef } from 'shared/table/actions/site-areas/table-site-area-generate-qr-code-connector-action';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppUnitPipe } from '../../../../shared/formatters/app-unit.pipe';
import { TableExportOCPPParamsAction, TableExportOCPPParamsActionDef } from '../../../../shared/table/actions/charging-stations/table-export-ocpp-params-action';
import { TableAssignAssetsToSiteAreaAction, TableAssignAssetsToSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-assign-assets-to-site-area-action';
import { TableAssignChargingStationsToSiteAreaAction, TableAssignChargingStationsToSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-assign-charging-stations-to-site-area-action';
import { TableViewAssignedAssetsOfSiteAreaAction, TableViewAssignedAssetsOfSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-assign-view-assets-of-site-area-action';
import { TableCreateSiteAreaAction, TableCreateSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-create-site-area-action';
import { TableDeleteSiteAreaAction, TableDeleteSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-delete-site-area-action';
import { TableEditSiteAreaAction, TableEditSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-edit-site-area-action';
import { TableViewChargingStationsOfSiteAreaAction, TableViewChargingStationsOfSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-view-charging-stations-of-site-area-action';
import { TableViewSiteAreaAction, TableViewSiteAreaActionDef } from '../../../../shared/table/actions/site-areas/table-view-site-area-action';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { SiteTableFilter } from '../../../../shared/table/filters/site-table-filter';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import ChangeNotification from '../../../../types/ChangeNotification';
import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction } from '../../../../types/GlobalType';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../types/Table';
import TenantComponents from '../../../../types/TenantComponents';
import { User } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';
import { SiteAreaAssetsDialogComponent } from '../site-area-assets/site-area-assets-dialog.component';
import { SiteAreaChargingStationsDialogComponent } from '../site-area-charging-stations/site-area-charging-stations-dialog.component';
import { SiteAreaDialogComponent } from '../site-area/site-area-dialog.component';
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
  private siteAreaGenerateQrCodeConnectorAction = new TableSiteAreaGenerateQrCodeConnectorAction().getActionDef();


  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private appUnitPipe: AppUnitPipe,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private windowService: WindowService,
    private componentService: ComponentService) {
    super(spinnerService, translateService);
    // Init
    this.isAssetComponentActive = this.componentService.isActive(TenantComponents.ASSET);
    this.setStaticFilters([{ WithSite: true }]);
    this.initDataSource();
    this.initUrlParams();
  }

  public initUrlParams() {
    const siteAreaID = this.windowService.getSearch('SiteAreaID');
    if (siteAreaID) {
      this.centralServerService.getSiteArea(siteAreaID).subscribe((siteArea) => {
        if (siteArea) {
          this.editAction.action(SiteAreaDialogComponent, siteArea, this.dialog);
        }
      });
    }
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
        name: 'site_areas.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'maximumPower',
        name: 'site_areas.max_limit_kw',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        sortable: true,
        formatter: (maximumPower: number) => this.appUnitPipe.transform(maximumPower, 'W', 'kW', true, 0, 0, 0),
      },
      {
        id: 'numberOfPhases',
        name: 'site_areas.number_of_phases',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
      },
    ];
    if (this.componentService.isActive(TenantComponents.SMART_CHARGING)) {
      tableColumnDef.push(
        {
          id: 'smartCharging',
          name: 'site_areas.smart_charging',
          headerClass: 'col-10p text-center',
          class: 'col-10p text-center',
          formatter: (smartCharging: boolean) => smartCharging ?
            this.translateService.instant('general.yes') : this.translateService.instant('general.no'),
        }
      );
    }
    tableColumnDef.push(
      {
        id: 'accessControl',
        name: 'site_areas.access_control',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        formatter: (accessControl: boolean) => accessControl ?
          this.translateService.instant('general.yes') : this.translateService.instant('general.no'),
      },
      {
        id: 'site.name',
        name: 'sites.site',
        headerClass: 'col-20p',
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
    );
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.push(
        {
          id: 'createdOn',
          name: 'users.created_on',
          formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
          headerClass: 'col-15em',
          class: 'col-15em',
          sortable: true,
        },
        {
          id: 'createdBy',
          name: 'users.created_by',
          formatter: (user: User) => Utils.buildUserFullName(user),
          headerClass: 'col-15em',
          class: 'col-15em',
        },
        {
          id: 'lastChangedOn',
          name: 'users.changed_on',
          formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
          headerClass: 'col-15em',
          class: 'col-15em',
          sortable: true,
        },
        {
          id: 'lastChangedBy',
          name: 'users.changed_by',
          formatter: (user: User) => Utils.buildUserFullName(user),
          headerClass: 'col-15em',
          class: 'col-15em',
        },
      );
    }
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canCreateSiteArea()) {
      return [
        new TableCreateSiteAreaAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(siteArea: SiteArea): TableActionDef[] {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    let actions: TableActionDef[];
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(siteArea.address);
    if (siteArea.issuer) {
      if (this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(siteArea.siteID)) {
        actions = [
          this.editAction,
          this.authorizationService.isAdmin() ? this.assignChargingStationsToSiteAreaAction : this.viewChargingStationsOfSiteArea,
          new TableMoreAction([
            this.exportOCPPParamsAction,
            openInMaps,
            this.siteAreaGenerateQrCodeConnectorAction,
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
    } else {
      actions = [
        this.viewAction,
        this.viewChargingStationsOfSiteArea,
        new TableMoreAction([
          openInMaps,
        ]).getActionDef(),
      ];
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case SiteAreaButtonAction.CREATE_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableCreateSiteAreaActionDef).action(SiteAreaDialogComponent, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public rowActionTriggered(actionDef: TableActionDef, siteArea: SiteArea) {
    switch (actionDef.id) {
      case SiteAreaButtonAction.EDIT_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableEditSiteAreaActionDef).action(SiteAreaDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.VIEW_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableViewSiteAreaActionDef).action(
            SiteAreaDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableAssignChargingStationsToSiteAreaActionDef).action(
            SiteAreaChargingStationsDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableViewChargingStationsOfSiteAreaActionDef).action(
            SiteAreaChargingStationsDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.DELETE_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableDeleteSiteAreaActionDef).action(
            siteArea, this.dialogService, this.translateService, this.messageService,
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
          (actionDef as TableExportOCPPParamsActionDef).action(
            { siteArea }, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService
          );
        }
        break;
      case SiteAreaButtonAction.ASSIGN_ASSETS_TO_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableAssignAssetsToSiteAreaActionDef).action(
            SiteAreaAssetsDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteAreaButtonAction.VIEW_ASSETS_OF_SITE_AREA:
        if (actionDef.action) {
          (actionDef as TableViewAssignedAssetsOfSiteAreaActionDef).action(
            SiteAreaAssetsDialogComponent, siteArea, this.dialog, this.refreshData.bind(this));
        }
        break;
        case ChargingStationButtonAction.GENERATE_QR_CODE:
          if (actionDef.action) {
            (actionDef as TableSiteAreaGenerateQrCodeConnectorsActionDef).action(
              siteArea, this.translateService, this.spinnerService,
              this.messageService, this.centralServerService, this.router
            );
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
    return [
      new IssuerFilter().getFilterDef(),
      new SiteTableFilter().getFilterDef(),
    ];
  }
}
