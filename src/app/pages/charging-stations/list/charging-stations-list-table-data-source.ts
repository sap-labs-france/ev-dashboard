import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Charger, DataResult, DropdownItem, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/common.types';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog.component';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
// @ts-ignore
import saveAs from 'file-saver';
import { Observable } from 'rxjs';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { TableExportAction } from '../../../shared/table/actions/table-export-action';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { ACTION_CLEAR_CACHE, ACTION_MORE_ACTIONS, ACTION_SMART_CHARGING, ACTION_SOFT_RESET, ChargingStationsMoreAction } from '../actions/charging-stations-more-action';
import { ChargingStationsRebootAction } from '../actions/charging-stations-reboot-action';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationsInstantPowerChargerProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { ChargingStationSmartChargingDialogComponent } from '../charging-limit/charging-station-charging-limit-dialog.component';
import { ChargingStationSettingsComponent } from '../charging-station/settings/charging-station-settings.component';
import { ChargingStationsConnectorsDetailComponent } from '../details-component/charging-stations-connectors-detail-component.component';
import { ChargingStationsMoreActionsDialogComponent } from '../more-actions/charging-stations-more-actions-dialog.component';

@Injectable()
export class ChargingStationsListTableDataSource extends TableDataSource<Charger> {
  private readonly isOrganizationComponentActive: boolean;
  private editAction = new TableEditAction().getActionDef();
  private rebootAction = new ChargingStationsRebootAction().getActionDef();
  private moreAction = new ChargingStationsMoreAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService,
  ) {
    super(spinnerService);
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(ComponentType.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{WithSite: true}]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadDataImpl(): Observable<DataResult<Charger>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
        // Update details status
        chargers.result.forEach((charger) => {
          // At first filter out the connectors that are null
          charger.connectors = charger.connectors.filter((connector) => !Utils.isNull(connector));
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
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: ChargingStationsHeartbeatCellComponent,
        sortable: false,
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorsCellComponent,
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        sortable: false,
        isAngularComponent: true,
        headerClass: 'text-center',
        class: 'power-progress-bar',
        angularComponent: ChargingStationsInstantPowerChargerProgressBarCellComponent,
      },
    ];
    if (this.isOrganizationComponentActive) {
      tableColumns = tableColumns.concat(
        [
          {
            id: 'siteArea.site.name',
            name: 'sites.site',
            sortable: true,
            defaultValue: 'sites.unassigned',
            class: 'd-none d-xl-table-cell',
            headerClass: 'd-none d-xl-table-cell',
          },
        ],
      );
    }
    if (this.authorizationService.isAdmin()) {
      tableColumns = tableColumns.concat(
        [
          {
            id: 'chargePointVendor',
            name: 'chargers.vendor',
            headerClass: 'd-none d-lg-table-cell',
            class: 'd-none d-lg-table-cell',
            sortable: true,
          },
          {
            id: 'firmwareVersion',
            name: 'chargers.firmware_version',
            headerClass: 'd-none d-xl-table-cell text-center',
            class: 'd-none d-xl-table-cell text-center',
            sortable: false,
          },
          {
            id: 'ocppVersion',
            name: 'chargers.ocpp_version_title',
            headerClass: 'd-none d-xl-table-cell text-center',
            class: 'd-none d-xl-table-cell text-center',
            sortable: false,
          },
        ],
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
      case 'export':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.export.title'),
          this.translateService.instant('chargers.dialog.export.confirm'),
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.exportChargingStations();
          }
        });
        break;
      case 'open_in_maps':
        this.openGeoMap();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Charger, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showChargingStationDialog(rowItem);
        break;
      case 'reboot':
        this.simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({type: 'Hard'}),
          this.translateService.instant('chargers.reboot_title'),
          this.translateService.instant('chargers.reboot_confirm', {chargeBoxID: rowItem.id}),
          this.translateService.instant('chargers.reboot_success', {chargeBoxID: rowItem.id}),
          'chargers.reset_error',
        );
        break;
      case 'open_in_maps':
        this.showPlace(rowItem);
        // this.openGeoMap(rowItem);
        break;
      case 'more':
        // @ts-ignore
        switch (dropdownItem.id) {
          case ACTION_SMART_CHARGING:
            this.dialogSmartCharging(rowItem);
            break;
          case 'delete':
            this.deleteChargingStation(rowItem);
            break;
          case ACTION_SOFT_RESET:
            this.simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({type: 'Soft'}),
              this.translateService.instant('chargers.soft_reset_title'),
              this.translateService.instant('chargers.soft_reset_confirm', {chargeBoxID: rowItem.id}),
              this.translateService.instant('chargers.soft_reset_success', {chargeBoxID: rowItem.id}),
              'chargers.soft_reset_error',
            );
            break;
          case ACTION_CLEAR_CACHE:
            this.simpleActionChargingStation('ChargingStationClearCache', rowItem, '',
              this.translateService.instant('chargers.clear_cache_title'),
              this.translateService.instant('chargers.clear_cache_confirm', {chargeBoxID: rowItem.id}),
              this.translateService.instant('chargers.clear_cache_success', {chargeBoxID: rowItem.id}),
              'chargers.clear_cache_error',
            );
            break;

          case ACTION_MORE_ACTIONS:
            this.dialogMoreActions(rowItem);
            break;
          default:
            break;
        }
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        //      new ChargerTableFilter().getFilterDef(),
        new SiteTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public showChargingStationDialog(chargingStation?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.height = '90vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (chargingStation) {
      dialogConfig.data = chargingStation;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(ChargingStationSettingsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  buildTableDynamicRowActions(charger: Charger): TableActionDef[] {
    if (!charger) {
      return [];
    }
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // check if GPs are available
    openInMaps.disabled = !(charger && charger.coordinates && charger.coordinates.length === 2);
    if (this.authorizationService.isSiteAdmin(charger.siteArea ? charger.siteArea.siteID : '')) {
      return [
        this.editAction,
        openInMaps,
        this.rebootAction,
        this.moreAction,
      ];
    }
    return [openInMaps];
  }

  private simpleActionChargingStation(action: string, charger: Charger, args: any, title: string, message: string, successMessage: string, errorMessage: string) {
    if (charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        title,
        message,
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          // Call REST service
          this.centralServerService.actionChargingStation(action, charger.id, args).subscribe((response) => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // Success + reload
              this.messageService.showSuccessMessage(successMessage);
              this.refreshData().subscribe();
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, errorMessage);
            }
          }, (error) => {
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              errorMessage);
          });
        }
      });
    }
  }

  private deleteChargingStation(chargingStation: Charger) {
    if (!chargingStation.inactive && chargingStation.connectors.findIndex((connector) => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.delete_title'),
        this.translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.delete_title'),
        this.translateService.instant('chargers.delete_confirm', {chargeBoxID: chargingStation.id}),
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          this.centralServerService.deleteChargingStation(chargingStation.id).subscribe((response) => {
            if (response.status === Constants.REST_RESPONSE_SUCCESS) {
              this.refreshData().subscribe();
              this.messageService.showSuccessMessage('chargers.delete_success', {chargeBoxID: chargingStation.id});
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, 'chargers.delete_error');
            }
          }, (error) => {
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'chargers.delete_error');
          });
        }
      });
    }
  }

  private dialogSmartCharging(chargingStation?: Charger) {
    if (chargingStation && (chargingStation.inactive || parseFloat(chargingStation.ocppVersion) < 1.6)) {
      if (chargingStation.inactive) {
        // Charger is not connected
        this.dialogService.createAndShowOkDialog(
          this.translateService.instant('chargers.action_error.smart_charging_title'),
          this.translateService.instant('chargers.action_error.smart_charging_charger_disconnected'));
      } else if (parseFloat(chargingStation.ocppVersion) < 1.6) {
        this.dialogService.createAndShowOkDialog(
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
      // disable outside click close
      dialogConfig.disableClose = true;
      // Open
      const dialogRef = this.dialog.open(ChargingStationSmartChargingDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((saved) => {
        if (saved) {
          this.refreshData().subscribe();
        }
      });
    }
  }

  private dialogMoreActions(chargingStation?: Charger) {
    if (chargingStation && chargingStation.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(
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
      // disable outside click close
      dialogConfig.disableClose = true;
      // Open
      this.dialog.open(ChargingStationsMoreActionsDialogComponent, dialogConfig);
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

  private showPlace(charger: Charger) {
    if (charger && charger.coordinates && charger.coordinates.length === 2) {
      window.open(`http://maps.google.com/maps?q=${charger.coordinates[1]},${charger.coordinates[0]}`);
    }
  }

  private openGeoMap(charger?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';

    if (charger) {
      // Set data
      dialogConfig.data = {
        latitude: this.getChargerLatitudeLongitude(charger).latitude,
        longitude: this.getChargerLatitudeLongitude(charger).longitude,
        label: charger.id ? charger.id : '',
        displayOnly: true,
        dialogTitle: charger.id ? charger.id : '',
      };
    } else {
      const markers = this.getData().map((currCharger) => {
        return {
          latitude: this.getChargerLatitudeLongitude(currCharger).latitude,
          longitude: this.getChargerLatitudeLongitude(currCharger).longitude,
          labelFormatted: currCharger.id,
        };
      });
      // Set data
      dialogConfig.data = {
        displayOnly: true,
        dialogTitle: this.translateService.instant('chargers.dialog.localisation.title'),
        markers,
      };
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(GeoMapDialogComponent, dialogConfig);
  }

  private getChargerLatitudeLongitude(charger: Charger) {
    let latitude = 0;
    let longitude = 0;
    if (charger && charger.coordinates && charger.coordinates.length === 2) {
      // get latitude/longitude from form
      latitude = charger.coordinates[1];
      longitude = charger.coordinates[0];
    }

    // if one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      const siteArea = charger.siteArea;

      if (siteArea) {
        if (siteArea.address && siteArea.address.coordinates && siteArea.address.coordinates.length === 2) {
          longitude = siteArea.address.coordinates[0];
          latitude = siteArea.address.coordinates[1];
        } else {
          const site = siteArea.site;

          if (site && site.address && site.address.coordinates && site.address.coordinates.length === 2) {
            longitude = site.address.coordinates[0];
            latitude = site.address.coordinates[1];
          }
        }
      }
    }
    return {latitude, longitude};
  }
}
