import { ButtonType, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { ChargingStation, ChargingStationButtonAction, ConnStatus, Connector } from 'app/types/ChargingStation';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AuthorizationService } from 'app/services/authorization.service';
import { ButtonAction } from 'app/types/GlobalType';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingStationSmartChargingDialogComponent } from '../charging-limit/charging-station-charging-limit-dialog.component';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsConnectorsDetailComponent } from '../details-component/charging-stations-connectors-detail-component.component';
import { ChargingStationsFirmwareStatusCellComponent } from '../cell-components/charging-stations-firmware-status-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationsInstantPowerChargerProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { ComponentService } from '../../../services/component.service';
import { Constants } from 'app/utils/Constants';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableChargingStationsClearCacheAction } from '../../../shared/table/actions/table-charging-stations-clear-cache-action';
import { TableChargingStationsForceAvailableStatusAction } from '../../../shared/table/actions/table-charging-stations-force-available-status-action';
import { TableChargingStationsForceUnavailableStatusAction } from '../../../shared/table/actions/table-charging-stations-force-unavailable-status-action';
import { TableChargingStationsRebootAction } from '../../../shared/table/actions/table-charging-stations-reboot-action';
import { TableChargingStationsResetAction } from '../../../shared/table/actions/table-charging-stations-reset-action';
import { TableChargingStationsSmartChargingAction } from '../../../shared/table/actions/table-charging-stations-smart-charging-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteChargingStationAction } from 'app/shared/table/actions/table-delete-charging-station-action';
import { TableEditChargingStationAction } from 'app/shared/table/actions/table-edit-charging-station-action';
import { TableExportAction } from '../../../shared/table/actions/table-export-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import TenantComponents from 'app/types/TenantComponents';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';

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
      this.setStaticFilters([{WithSite: true}]);
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
        chargers.result.forEach((charger: ChargingStation) => {
          // At first filter out the connectors that are null
          charger.connectors = charger.connectors.filter((connector: Connector) => !Utils.isNull(connector));
          charger.connectors.forEach((connector) => {
            connector.hasDetails = connector.activeTransactionID > 0;
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
    let tableColumns: TableColumnDef[] = [
      {
        id: 'id',
        name: 'chargers.name',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center col-30p',
        class: 'text-center col-30p',
        isAngularComponent: true,
        angularComponent: ChargingStationsHeartbeatCellComponent,
        sortable: false,
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorsCellComponent,
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        sortable: false,
        isAngularComponent: true,
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        angularComponent: ChargingStationsInstantPowerChargerProgressBarCellComponent,
      },
    ];
    if (this.authorizationService.isAdmin()) {
      tableColumns = tableColumns.concat([
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
        },
      ]);
    }
    if (this.isOrganizationComponentActive) {
      tableColumns.push(
        {
          id: 'siteArea.site.name',
          name: 'sites.site',
          sortable: true,
          defaultValue: 'sites.unassigned',
          class: 'd-none d-xl-table-cell col-20p',
          headerClass: 'd-none d-xl-table-cell col-20p',
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
        new TableExportAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ButtonAction.EXPORT:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.export.title'),
          this.translateService.instant('chargers.dialog.export.confirm'),
        ).subscribe((response) => {
          if (response === ButtonType.YES) {
            this.exportChargingStations();
          }
        });
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingStation: ChargingStation, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EDIT_CHARGING_STATION:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialog, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.REBOOT:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.SMART_CHARGING:
        this.dialogSmartCharging(chargingStation);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(chargingStation.coordinates);
        }
        break;
      case ChargingStationButtonAction.DELETE_CHARGING_STATION:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.SOFT_RESET:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.CLEAR_CACHE:
        if (actionDef.action) {
          (actionDef).action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.FORCE_AVAILABLE_STATUS:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.FORCE_UNAVAILABLE_STATUS:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        //      new ChargerTableFilter().getFilterDef(),
        new IssuerFilter().getFilterDef(),
        new SiteTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public buildTableDynamicRowActions(charger: ChargingStation): TableActionDef[] {
    if (!charger) {
      return [];
    }
    // Check if both connectors are unavailable
    let isUnavailable = true;
    for (const connector of charger.connectors) {
      if (connector.status !== ConnStatus.UNAVAILABLE) {
        isUnavailable = false;
        break;
      }
    }
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsGPSCoordinates(charger.coordinates);
    if (this.authorizationService.isAdmin() || this.authorizationService.isSiteAdmin(charger.siteArea ? charger.siteArea.siteID : '')) {
      return [
        this.editAction,
        this.smartChargingAction,
        this.rebootAction,
        new TableMoreAction([
          this.clearCacheAction,
          this.resetAction,
          isUnavailable ? this.forceAvailableStatusAction : this.forceUnavailableStatusAction,
          this.deleteAction,
          openInMaps,
        ]).getActionDef()
      ,
      ];
    }
    return [openInMaps];
  }

  private dialogSmartCharging(chargingStation: ChargingStation) {
    if (parseFloat(chargingStation.ocppVersion) < 1.6) {
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.smart_charging_title'),
        this.translateService.instant('chargers.action_error.smart_charging_charger_version'));
    } else {
      // Create the dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.minWidth = '80vw';
      dialogConfig.minHeight = '60vh';
      dialogConfig.maxHeight = '90vh';
      dialogConfig.panelClass = 'transparent-dialog-container';
      if (chargingStation) {
        dialogConfig.data = chargingStation;
      }
      // disable outside click close
      dialogConfig.disableClose = true;
      // Open
      const dialogRef = this.dialog.open(ChargingStationSmartChargingDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(() => {
        this.refreshData().subscribe();
      });
    }
  }

  private exportChargingStations() {
    this.spinnerService.show();
    this.centralServerService.exportChargingStations(this.buildFilterValues(), {
      limit: this.getTotalNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP,
    }, this.getSorting())
      .subscribe((result) => {
        this.spinnerService.hide();
        saveAs(result, 'exported-charging-stations.csv');
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }
}
