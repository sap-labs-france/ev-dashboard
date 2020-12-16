import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableChargingStationGenerateQrCodeConnectorAction, TableChargingStationGenerateQrCodeConnectorActionDef } from '../../../shared/table/actions/charging-stations/table-charging-station-generate-qr-code-connector-action';
import { TableChargingStationsClearCacheAction, TableChargingStationsClearCacheActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-clear-cache-action';
import { TableChargingStationsForceAvailableStatusAction, TableChargingStationsForceAvailableStatusActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-force-available-status-action';
import { TableChargingStationsForceUnavailableStatusAction, TableChargingStationsForceUnavailableStatusActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-force-unavailable-status-action';
import { TableChargingStationsRebootAction, TableChargingStationsRebootActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-reboot-action';
import { TableChargingStationsResetAction, TableChargingStationsResetActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-reset-action';
import { TableChargingStationsSmartChargingAction, TableChargingStationsSmartChargingActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import { TableDeleteChargingStationAction, TableDeleteChargingStationActionDef } from '../../../shared/table/actions/charging-stations/table-delete-charging-station-action';
import { TableEditChargingStationAction, TableEditChargingStationActionDef } from '../../../shared/table/actions/charging-stations/table-edit-charging-station-action';
import { TableExportChargingStationsAction, TableExportChargingStationsActionDef } from '../../../shared/table/actions/charging-stations/table-export-charging-stations-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargePointStatus, ChargingStation, ChargingStationButtonAction, Connector, FirmwareStatus } from '../../../types/ChargingStation';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsFirmwareStatusCellComponent } from '../cell-components/charging-stations-firmware-status-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationsInstantPowerChargerProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { ChargingStationLimitationDialogComponent } from '../charging-station-limitation/charging-station-limitation.dialog.component';
import { ChargingStationDialogComponent } from '../charging-station/charging-station-dialog.component';
import { ChargingStationsConnectorsDetailComponent } from '../details-component/charging-stations-connectors-detail-component.component';

@Injectable()
export class ChargingStationsListTableDataSource extends TableDataSource<ChargingStation> {
  private readonly isOrganizationComponentActive: boolean;
  private editAction = new TableEditChargingStationAction().getActionDef();
  private rebootAction = new TableChargingStationsRebootAction().getActionDef();
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();
  private clearCacheAction = new TableChargingStationsClearCacheAction().getActionDef();
  private resetAction = new TableChargingStationsResetAction().getActionDef();
  private forceAvailableStatusAction = new TableChargingStationsForceAvailableStatusAction().getActionDef();
  private forceUnavailableStatusAction = new TableChargingStationsForceUnavailableStatusAction().getActionDef();
  private deleteAction = new TableDeleteChargingStationAction().getActionDef();
  private generateQrCodeConnectorAction = new TableChargingStationGenerateQrCodeConnectorAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService,
  ) {
    super(spinnerService, translateService);
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{ WithSite: true }]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadDataImpl(): Observable<DataResult<ChargingStation>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingStations(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
          // Update details status
          chargers.result.forEach((chargingStation: ChargingStation) => {
            // At first filter out the connectors that are null
            chargingStation.connectors = chargingStation.connectors.filter((connector: Connector) => !Utils.isNullOrUndefined(connector));
            chargingStation.connectors.forEach((connector) => {
              connector.hasDetails = connector.currentTransactionID > 0;
              let connectorIsInactive = false;
              if (chargingStation.inactive ||
                  chargingStation.firmwareUpdateStatus === FirmwareStatus.INSTALLING) {
                connectorIsInactive = true;
              }
              connector.status = connectorIsInactive ? ChargePointStatus.UNAVAILABLE : connector.status;
              connector.currentInstantWatts = connectorIsInactive ? 0 : connector.currentInstantWatts;
              connector.currentStateOfCharge = connectorIsInactive ? 0 : connector.currentStateOfCharge;
              connector.currentTotalConsumptionWh = connectorIsInactive ? 0 : connector.currentTotalConsumptionWh;
              connector.currentTotalInactivitySecs = connectorIsInactive ? 0 : connector.currentTotalInactivitySecs;
            });
          });
          // Ok
          observer.next(chargers);
          observer.complete();
        }, (error) => {
          // No longer exists!
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
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ChargingStationsConnectorsDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    const tableColumns: TableColumnDef[] = [
      {
        id: 'id',
        name: 'chargers.name',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
      },
    ];
    if (this.isOrganizationComponentActive) {
      tableColumns.push(
        {
          id: 'siteArea.site.name',
          name: 'sites.site',
          defaultValue: 'sites.unassigned',
          class: 'd-none d-xl-table-cell col-20p',
          headerClass: 'd-none d-xl-table-cell col-20p',
        },
      );
    }
    tableColumns.push(
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center col-30p',
        class: 'text-center col-30p',
        isAngularComponent: true,
        angularComponent: ChargingStationsHeartbeatCellComponent,
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorsCellComponent,
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerChargerProgressBarCellComponent,
      },
      {
        id: 'public',
        name: 'chargers.public_charger',
        headerClass: 'text-center col-5em',
        class: 'text-center col-5em',
        formatter: (publicChargingStation: boolean) => publicChargingStation ?
          this.translateService.instant('general.yes') : this.translateService.instant('general.no')
      },
    );
    if (this.authorizationService.isAdmin()) {
      tableColumns.push(
        {
          id: 'firmwareVersion',
          name: 'chargers.firmware_version',
          headerClass: 'text-center col-20p',
          class: 'text-center table-cell-angular-big-component col-20p',
          sortable: false,
          isAngularComponent: true,
          angularComponent: ChargingStationsFirmwareStatusCellComponent,
        },
        {
          id: 'chargePointVendor',
          name: 'chargers.vendor',
          headerClass: 'd-none d-lg-table-cell col-20p',
          class: 'd-none d-lg-table-cell col-20p',
          sortable: true,
        },
        {
          id: 'ocppVersion',
          name: 'chargers.ocpp_version_title',
          headerClass: 'd-none d-xl-table-cell text-center col-10p',
          class: 'd-none d-xl-table-cell text-center col-10p',
          sortable: false,
          formatter: (ocppVersion: string, row: ChargingStation) => `${ocppVersion} / ${row.ocppProtocol}`
        },
      );
    }
    return tableColumns;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      return [
        new TableExportChargingStationsAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EXPORT_CHARGING_STATIONS:
        if (actionDef.action) {
          (actionDef as TableExportChargingStationsActionDef).action(
            this.buildFilterValues(), this.dialogService, this.translateService,
            this.messageService, this.centralServerService, this.router, this.spinnerService);
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingStation: ChargingStation, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EDIT_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableEditChargingStationActionDef).action(
            ChargingStationDialogComponent, chargingStation, this.dialog, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.REBOOT:
        if (actionDef.action) {
          (actionDef as TableChargingStationsRebootActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.SMART_CHARGING:
        if (actionDef.action) {
          (actionDef as TableChargingStationsSmartChargingActionDef).action(
            ChargingStationLimitationDialogComponent, chargingStation, this.dialogService, this.translateService,
            this.dialog, this.refreshData.bind(this)
          );
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(chargingStation.coordinates);
        }
        break;
      case ChargingStationButtonAction.DELETE_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableDeleteChargingStationActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.SOFT_RESET:
        if (actionDef.action) {
          (actionDef as TableChargingStationsResetActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.CLEAR_CACHE:
        if (actionDef.action) {
          (actionDef as TableChargingStationsClearCacheActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.FORCE_AVAILABLE_STATUS:
        if (actionDef.action) {
          (actionDef as TableChargingStationsForceAvailableStatusActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
       case ChargingStationButtonAction.GENERATE_QR_CODE:
        if (actionDef.action) {
          (actionDef as TableChargingStationGenerateQrCodeConnectorActionDef).action(
            chargingStation, this.translateService, this.spinnerService, this.messageService,
            this.centralServerService, this.router);
        }
        break;
      case ChargingStationButtonAction.FORCE_UNAVAILABLE_STATUS:
        if (actionDef.action) {
          (actionDef as TableChargingStationsForceUnavailableStatusActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        // new ChargingStationTableFilter().getFilterDef(),
        new IssuerFilter().getFilterDef(),
        new SiteTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public buildTableDynamicRowActions(chargingStation: ChargingStation): TableActionDef[] {
    if (!chargingStation) {
      return [];
    }
    // Check if both connectors are unavailable
    let isUnavailable = true;
    for (const connector of chargingStation.connectors) {
      if (connector.status !== ChargePointStatus.UNAVAILABLE) {
        isUnavailable = false;
        break;
      }
    }
    // Check if GPS is available
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    openInMaps.disabled = !Utils.containsGPSCoordinates(chargingStation.coordinates);
    if (chargingStation.issuer) {
      if (this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(chargingStation.siteArea ? chargingStation.siteArea.siteID : '')) {
        return [
          this.editAction,
          this.smartChargingAction,
          this.rebootAction,
          new TableMoreAction([
            this.clearCacheAction,
            this.resetAction,
            isUnavailable ? this.forceAvailableStatusAction : this.forceUnavailableStatusAction,
            this.generateQrCodeConnectorAction,
            openInMaps,
            this.deleteAction,
          ]).getActionDef()
          ,
        ];
      }
    }
    return [openInMaps];
  }
}
