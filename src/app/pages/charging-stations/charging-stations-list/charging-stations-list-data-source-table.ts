import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Charger, Connector, DropdownItem, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/common.types';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { InstantPowerProgressBarComponent } from '../cell-content-components/instant-power-progress-bar.component';
import { ConnectorsDetailComponent } from '../details-content-component/connectors-detail-component.component';
import { HeartbeatCellComponent } from '../cell-content-components/heartbeat-cell.component';
import { ConnectorsCellComponent } from '../cell-content-components/connectors-cell.component';
import { TableSettingsAction } from 'app/shared/table/actions/table-settings-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import {
  ACTION_CLEAR_CACHE,
  ACTION_MORE_ACTIONS,
  ACTION_REBOOT,
  ACTION_SMART_CHARGING,
  ACTION_SOFT_RESET,
  TableChargerMoreAction
} from '../other-actions-button/table-charger-more-action';
import { SitesTableFilter } from 'app/shared/table/filters/site-filter';
import { ChargingStationSettingsComponent } from '../charging-station-settings/charging-station-settings.component';
import { Injectable } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';
import { Constants } from 'app/utils/Constants';
import { ChargingStationSmartChargingDialogComponent } from '../smart-charging/smart-charging.dialog.component';
import { ChargingStationMoreActionsDialogComponent } from '../more-actions/charging-station-more-actions.dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import saveAs from 'file-saver';
import { TableExportAction } from '../../../shared/table/actions/table-export-action';
import { TableChargerSiteAreaAction } from '../other-actions-button/table-charger-sitearea-action';
import { SiteAreaDialogComponent } from '../charging-station-settings/site-area/site-area.dialog.component';
import { TableChargerRebootAction } from '../other-actions-button/table-charger-reboot-action';
import { TableChargerSmartChargingAction } from '../other-actions-button/table-charger-smart-charging-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog-component';
import { TableNoAction } from 'app/shared/table/actions/table-no-action';

const POLL_INTERVAL = 15000;

const DEFAULT_ADMIN_ROW_ACTIONS = [
  new TableEditAction().getActionDef(),
  new TableOpenInMapsAction().getActionDef(),
  new TableChargerRebootAction().getActionDef(),
//  new TableChargerSmartChargingAction().getActionDef(),
  new TableChargerMoreAction().getActionDef(),
];

const DEFAULT_BASIC_ROW_ACTIONS = [
//  new TableEditAction().getActionDef(),
  new TableNoAction().getActionDef()
]

@Injectable()
export class ChargingStationsListDataSource extends TableDataSource<Charger> {

  isAdmin: boolean;

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super();
    this.setStaticFilters([{ 'WithSite': true }]);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadData(refreshAction: boolean) {
    if (!refreshAction) {
      // Show
      this.spinnerService.show();
    }
    // Get data
    this.centralServerService.getChargers(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((chargers) => {
        if (!refreshAction) {
          // Show
          this.spinnerService.hide();
        }
        // Set number of records
        this.setNumberOfRecords(chargers.count);
        // Update details status
        chargers.result.forEach(charger => {
          charger.connectors.forEach(connector => {
            connector.hasDetails = connector.activeTransactionID > 0;
          });
        });
        // Update page length
        this.updatePaginator();
        this.setData(chargers.result);
      }, (error) => {
        // Show
        this.spinnerService.hide();
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getConnectors(id): Observable<Connector> {
    this.getData().forEach(charger => {
      if (charger.id === id) {
        return charger;
      }
    });
    return null;
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowSelection: {
        enabled: false,
        multiple: false
      },
      rowDetails: {
        enabled: true,
        isDetailComponent: true,
        detailComponentName: ConnectorsDetailComponent
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    let tableColumns: TableColumnDef[] = [
      {
        id: 'id',
        name: 'chargers.name',
        sortable: true,
        sorted: true,
        direction: 'asc'
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponentName: HeartbeatCellComponent,
        sortable: false
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center',
        sortable: false,
        isAngularComponent: true,
        angularComponentName: ConnectorsCellComponent
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        sortable: false,
        isAngularComponent: true,
        headerClass: 'text-center',
        class: 'power-progress-bar',
        angularComponentName: InstantPowerProgressBarComponent
      }
    ];
    if (this.centralServerService.isComponentActive(Constants.SETTINGS_ORGANIZATION)) {
      tableColumns = tableColumns.concat(
        [
        {
          id: 'siteArea.site.name',
          name: 'sites.site',
          sortable: true,
          defaultValue: 'sites.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'sites.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          },
          dynamicClass: (row: Charger) => {
            return (row.siteArea ? '' : 'charger-not-assigned') + ' d-none d-xl-table-cell';
          }
        },
        {
          id: 'siteArea.name',
          name: 'site_areas.title',
          sortable: true,
          defaultValue: 'site_areas.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'site_areas.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          },
          dynamicClass: (row: Charger) => {
            return (row.siteArea ? '' : 'charger-not-assigned') + ' d-none d-xl-table-cell';
          }
        }
      ]
      );
    }
    if (this.isAdmin) {
      tableColumns = tableColumns.concat(
        [
          {
            id: 'chargePointVendor',
            name: 'chargers.vendor',
            headerClass: 'd-none d-lg-table-cell',
            class: 'd-none d-lg-table-cell',
            sortable: true
          },
          {
            id: 'ocppVersion',
            name: 'chargers.ocpp_version_title',
            headerClass: 'd-none d-xl-table-cell text-center',
            class: 'd-none d-xl-table-cell text-center',
            sortable: false
          }
        ]
      )
    }
    return tableColumns;
    if (this.isAdmin) {
      return [
        {
          id: 'id',
          name: 'chargers.name',
          sortable: true,
          sorted: true,
          direction: 'asc'
        },
        {
          id: 'inactive',
          name: 'chargers.heartbeat_title',
          headerClass: 'text-center',
          isAngularComponent: true,
          angularComponentName: HeartbeatCellComponent,
          sortable: false
        },
        {
          id: 'connectorsStatus',
          name: 'chargers.connectors_title',
          headerClass: 'text-center',
          sortable: false,
          isAngularComponent: true,
          angularComponentName: ConnectorsCellComponent
        },
        {
          id: 'connectorsConsumption',
          name: 'chargers.consumption_title',
          sortable: false,
          isAngularComponent: true,
          headerClass: 'text-center',
          class: 'power-progress-bar',
          angularComponentName: InstantPowerProgressBarComponent
        },
        {
          id: 'siteArea.site.name',
          name: 'sites.site',
          sortable: true,
          defaultValue: 'sites.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'sites.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          },
          dynamicClass: (row: Charger) => {
            return (row.siteArea ? '' : 'charger-not-assigned') + ' d-none d-xl-table-cell';
          }
        },
        {
          id: 'siteArea.name',
          name: 'site_areas.title',
          sortable: true,
          defaultValue: 'site_areas.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'site_areas.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          },
          dynamicClass: (row: Charger) => {
            return (row.siteArea ? '' : 'charger-not-assigned') + ' d-none d-xl-table-cell';
          }
        },
        {
          id: 'chargePointVendor',
          name: 'chargers.vendor',
          headerClass: 'd-none d-lg-table-cell',
          class: 'd-none d-lg-table-cell',
          sortable: true
          /*          formatter: (value, row: Charger) => {
                      return `${row.chargePointVendor} - ${row.chargePointModel}`;
                    },*/
        },
        /*        {
                  id: 'chargePointModel',
                  name: 'chargers.model',
                  headerClass: 'd-none d-xl-table-cell',
                  class: 'd-none d-xl-table-cell',
                  sortable: true
                },*/
        {
          id: 'ocppVersion',
          name: 'chargers.ocpp_version_title',
          headerClass: 'd-none d-xl-table-cell text-center',
          class: 'd-none d-xl-table-cell text-center',
          sortable: false
        }
      ];
    } else {
      return [
        {
          id: 'id',
          name: 'chargers.name',
          sortable: true,
          sorted: true,
          direction: 'asc',
        },
        {
          id: 'inactive',
          name: 'chargers.heartbeat_title',
          headerClass: 'text-center',
          isAngularComponent: true,
          angularComponentName: HeartbeatCellComponent,
          sortable: false
        },
        {
          id: 'connectorsStatus',
          name: 'chargers.connectors_title',
          headerClass: 'text-center',
          sortable: false,
          isAngularComponent: true,
          angularComponentName: ConnectorsCellComponent
        },
        {
          id: 'connectorsConsumption',
          name: 'chargers.consumption_title',
          sortable: false,
          isAngularComponent: true,
          angularComponentName: InstantPowerProgressBarComponent
        },
        {
          id: 'siteArea.site.name',
          name: 'sites.site',
          sortable: true,
          defaultValue: 'sites.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          class:  'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'sites.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          }
        },
        {
          id: 'siteArea.name',
          name: 'site_areas.title',
          sortable: true,
          defaultValue: 'site_areas.unassigned',
          headerClass: 'd-none d-xl-table-cell',
          class:  'd-none d-xl-table-cell',
          formatter: (value) => {
            if (value === 'site_areas.unassigned') {
              return this.translateService.instant(value)
            } else {
              return value;
            }
          }
        },
      ];
    }
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    if (this.authorizationService.isAdmin()) {
      return [
        // new TableOpenInMapsAction().getActionDef(),
        new TableExportAction().getActionDef()
      ];
    } else {
      return []; // new TableOpenInMapsAction().getActionDef() ];
    }
  }

  public getTableRowActions(): TableActionDef[] {
    if (this.authorizationService.isAdmin()) {
      return DEFAULT_ADMIN_ROW_ACTIONS;
    } else if (this.authorizationService.isDemo()) {
      return DEFAULT_BASIC_ROW_ACTIONS;
    } else if (this.authorizationService.isBasic()) {
      return DEFAULT_BASIC_ROW_ACTIONS;
    } else {
      return [
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'export':
        this.dialogService.createAndShowYesNoDialog(
          this.dialog,
          this.translateService.instant('chargers.dialog.export.title'),
          this.translateService.instant('chargers.dialog.export.confirm')
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.exportChargingStations();
          }
        });
        break;
      case 'open_in_maps':
        this._openGeoMap();
      break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Charger, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showChargingStationDialog(rowItem);
        break;
      case 'reboot':
        this._simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({ type: 'Hard' }),
          this.translateService.instant('chargers.reboot_title'),
          this.translateService.instant('chargers.reboot_confirm', { 'chargeBoxID': rowItem.id }),
          this.translateService.instant('chargers.reboot_success', { 'chargeBoxID': rowItem.id }),
          'chargers.reset_error'
        );
        break;
        case 'open_in_maps':
          this._showPlace(rowItem);
          // this._openGeoMap(rowItem);
        break;
      case 'more':
        switch (dropdownItem.id) {
          case ACTION_SMART_CHARGING:
            this._dialogSmartCharging(rowItem);
          break;
          case 'delete':
            this._deleteChargingStation(rowItem);
            break;
/*          case 'sitearea':
            this._assignSiteArea(rowItem);
            break;*/
          case ACTION_SOFT_RESET:
            this._simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({ type: 'Soft' }),
              this.translateService.instant('chargers.soft_reset_title'),
              this.translateService.instant('chargers.soft_reset_confirm', { 'chargeBoxID': rowItem.id }),
              this.translateService.instant('chargers.soft_reset_success', { 'chargeBoxID': rowItem.id }),
              'chargers.soft_reset_error'
            );
            break;
          case ACTION_CLEAR_CACHE:
            this._simpleActionChargingStation('ChargingStationClearCache', rowItem, '',
              this.translateService.instant('chargers.clear_cache_title'),
              this.translateService.instant('chargers.clear_cache_confirm', { 'chargeBoxID': rowItem.id }),
              this.translateService.instant('chargers.clear_cache_success', { 'chargeBoxID': rowItem.id }),
              'chargers.clear_cache_error'
            );
            break;

          case ACTION_MORE_ACTIONS:
            this._dialogMoreActions(rowItem);
            break;
          default:
            break;
        }
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public onRowActionMenuOpen(action: TableActionDef, row: Charger) {
    /*    action.dropdownItems.forEach(dropDownItem => {
          if (dropDownItem.id === ACTION_SMART_CHARGING) {
            // Check charging station version
            dropDownItem.disabled = row.ocppVersion === Constants.OCPP_VERSION_12 ||
              row.ocppVersion === Constants.OCPP_VERSION_15 ||
              row.inactive;
          } else {
            // Check active status of CS
            dropDownItem.disabled = row.inactive;
          }
        });*/
  }

  public getTableFiltersDef(): TableFilterDef[] {
    if (this.centralServerService.isComponentActive(Constants.SETTINGS_ORGANIZATION)) {
      return [
        //      new ChargerTableFilter().getFilterDef(),
        new SitesTableFilter().getFilterDef()
      ];
    } else {
      return [];
    }
  }

  private _simpleActionChargingStation(action: string, charger: Charger, args, title, message, success_message, error_message) {
    if (charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(this.dialog,
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        this.dialog,
        title,
        message
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          // Call REST service
          this.centralServerService.actionChargingStation(action, charger.id, args).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // Success + reload
              this.messageService.showSuccessMessage(success_message);
              this.loadData(true);
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, error_message);
            }
          }, (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              error_message);
          });
        }
      });
    }
  }

  private _showChargingStationDialog(chargingStation?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.height = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (chargingStation) {
      dialogConfig.data = chargingStation;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(ChargingStationSettingsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData(true));
  }

  private _deleteChargingStation(chargingStation: Charger) {
    if (chargingStation.connectors.findIndex(connector => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      this.dialogService.createAndShowOkDialog(this.dialog,
        this.translateService.instant('chargers.action_error.delete_title'),
        this.translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      this.dialogService.createAndShowYesNoDialog(
        this.dialog,
        this.translateService.instant('chargers.delete_title'),
        this.translateService.instant('chargers.delete_confirm', { 'chargeBoxID': chargingStation.id })
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          this.centralServerService.deleteChargingStation(chargingStation.id).subscribe(response => {
            if (response.status === Constants.REST_RESPONSE_SUCCESS) {
              this.loadData(true);
              this.messageService.showSuccessMessage('chargers.delete_success', { 'chargeBoxID': chargingStation.id });
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, 'chargers.delete_error');
            }
          }, (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'chargers.delete_error');
          });
        }
      });
    }
  }

  private _dialogSmartCharging(chargingStation?: Charger) {
    if (chargingStation.inactive || parseFloat(chargingStation.ocppVersion) < 1.6) {
      if (chargingStation.inactive) {
        // Charger is not connected
        this.dialogService.createAndShowOkDialog(this.dialog,
          this.translateService.instant('chargers.action_error.smart_charging_title'),
          this.translateService.instant('chargers.action_error.smart_charging_charger_disconnected'));
      } else if (parseFloat(chargingStation.ocppVersion) < 1.6) {
        this.dialogService.createAndShowOkDialog(this.dialog,
          this.translateService.instant('chargers.action_error.smart_charging_title'),
          this.translateService.instant('chargers.action_error.smart_charging_charger_version'));
      }
    } else {
      // Create the dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.minWidth = '80vw';
      dialogConfig.minHeight = '80vh';
      dialogConfig.panelClass = 'transparent-dialog-container';
      if (chargingStation) {
        dialogConfig.data = chargingStation;
      }
      // Open
      const dialogRef = this.dialog.open(ChargingStationSmartChargingDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => this.loadData(true));
    }
  }

  private _dialogMoreActions(chargingStation?: Charger) {
    if (chargingStation.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(this.dialog,
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Create the dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.minWidth = '80vw';
      dialogConfig.minHeight = '80vh';
      dialogConfig.panelClass = 'transparent-dialog-container';
      if (chargingStation) {
        dialogConfig.data = chargingStation;
      }
      // Open
      const dialogRef = this.dialog.open(ChargingStationMoreActionsDialogComponent, dialogConfig);
    }
  }

  private _assignSiteArea(charger: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    if (charger) {
      dialogConfig.data = charger;
    }
    // Open
    this.dialog.open(SiteAreaDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        //        this.charger.siteArea = <SiteArea>result[0];
      });
  }

  definePollingIntervalStrategy() {
    this.setPollingInterval(POLL_INTERVAL);
  }

  specificRowActions(charger: Charger) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    let actionTable: any[];
    // check if GPs are available
    openInMaps.disabled = (charger && charger.latitude && charger.longitude ) ? false : true;
    if (this.authorizationService.isAdmin()) {
      actionTable = JSON.parse(JSON.stringify(DEFAULT_ADMIN_ROW_ACTIONS));
      actionTable[1] = openInMaps;
      // return DEFAULT_ADMIN_ROW_ACTIONS;
    } else if (this.authorizationService.isDemo()) {
      actionTable = [openInMaps]; // JSON.parse(JSON.stringify(DEFAULT_BASIC_ROW_ACTIONS));
      // DEFAULT_BASIC_ROW_ACTIONS[1] = openInMaps;
      // return DEFAULT_BASIC_ROW_ACTIONS;
    } else if (this.authorizationService.isBasic()) {
      actionTable = [openInMaps]; // JSON.parse(JSON.stringify(DEFAULT_BASIC_ROW_ACTIONS));
      // DEFAULT_BASIC_ROW_ACTIONS[1] = openInMaps;
      // return DEFAULT_BASIC_ROW_ACTIONS;
    } else {
      return [ new TableNoAction().getActionDef()
      ];
    }
    return actionTable;
  }

  private exportChargingStations() {
    this.centralServerService.exportChargingStations(this.getFilterValues(), {
      limit: this.getNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP
    }, this.getOrdering())
      .subscribe((result) => {
        saveAs(result, 'exportChargingStations.csv');
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  private _showPlace(charger: Charger) {
    if (charger && charger.longitude && charger.latitude) {
      window.open(`http://maps.google.com/maps?q=${charger.latitude},${charger.longitude}`);
    }
  }

  private _openGeoMap(charger?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';

    if (charger) {
/*      // get latitud/longitude from form
      let latitude = charger.latitude;
      let longitude = charger.longitude;

      // if one is not available try to get from SiteArea and then from Site
      if (!latitude || !longitude) {
        const siteArea = charger.siteArea;

        if (siteArea && siteArea.address) {
          if (siteArea.address.latitude && siteArea.address.longitude) {
            latitude = siteArea.address.latitude;
            longitude = siteArea.address.longitude;
          } else {
            const site = siteArea.site;

            if (site && site.address && site.address.latitude && site.address.longitude) {
              latitude = site.address.latitude;
              longitude = site.address.longitude;
            }
          }
        }
      }*/

      // Set data
      dialogConfig.data = {
        latitude: this._getChargerLatitudeLongitude(charger).latitude,
        longitude: this._getChargerLatitudeLongitude(charger).longitude,
        label: charger.id ? charger.id : '',
        displayOnly: true,
        dialogTitle: charger.id ? charger.id : ''
      }
    } else {
      const markers = this.getData().map(currCharger => { return {
        latitude: this._getChargerLatitudeLongitude(currCharger).latitude,
        longitude: this._getChargerLatitudeLongitude(currCharger).longitude,
        labelFormatted: currCharger.id }
      });
      // Set data
      dialogConfig.data = {
        displayOnly: true,
        dialogTitle: this.translateService.instant('chargers.dialog.localisation.title'),
        markers: markers
      }
    }

    // Open
    this.dialog.open(GeoMapDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
      });
  }

  private _getChargerLatitudeLongitude(charger: Charger) {
    let latitude = 0;
      let longitude = 0;
    if (charger) {
      // get latitud/longitude from form
      latitude = charger.latitude;
      longitude = charger.longitude;

      // if one is not available try to get from SiteArea and then from Site
      if (!latitude || !longitude) {
        const siteArea = charger.siteArea;

        if (siteArea && siteArea.address) {
          if (siteArea.address.latitude && siteArea.address.longitude) {
            latitude = siteArea.address.latitude;
            longitude = siteArea.address.longitude;
          } else {
            const site = siteArea.site;

            if (site && site.address && site.address.latitude && site.address.longitude) {
              latitude = site.address.latitude;
              longitude = site.address.longitude;
            }
          }
        }
      }
    }
    return {latitude: latitude, longitude: longitude};
  }
}
