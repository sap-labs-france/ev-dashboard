import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from 'app/shared/table/table-data-source';
import {
  Charger,
  ChargerInError,
  Connector,
  DropdownItem,
  SubjectInfo,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef
} from 'app/common.types';
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
import { HeartbeatCellComponent } from '../cell-content-components/heartbeat-cell.component';
import { ConnectorsCellComponent } from '../cell-content-components/connectors-cell.component';
import { TableSettingsAction } from 'app/shared/table/actions/table-settings-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { ACTION_SMART_CHARGING, TableChargerMoreAction } from '../other-actions-button/table-charger-more-action';
import { SitesTableFilter } from 'app/shared/table/filters/site-filter';
import { ChargingStationSettingsComponent } from '../charging-station-settings/charging-station-settings.component';
import { Injectable } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';
import { Constants } from 'app/utils/Constants';
import { ConnectorsErrorDetailComponent } from './detail-component/connectors-error-detail-component.component';
import { TableChargerResetAction } from '../other-actions-button/table-charger-reset-action';
import { TableChargerRebootAction } from '../other-actions-button/table-charger-reboot-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { ErrorMessage } from '../../../shared/dialogs/error-details/error-code-details-dialog.component';
import { ChargingStations } from '../../../utils/ChargingStations';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-details/error-code-details.component';
import en from '../../../../assets/i18n/en.json';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-filter';

const POLL_INTERVAL = 30000;

const ACTION_MAP = {
  missingSettings: [
    new TableEditAction().getActionDef(),
    new TableDeleteAction().getActionDef()
  ],
  missingSiteArea: [
    new TableEditAction().getActionDef(),
    new TableDeleteAction().getActionDef()
  ],
  connectionBroken: [
    new TableEditAction().getActionDef(),
    new TableDeleteAction().getActionDef()
  ],
  connectorError: [
    new TableChargerResetAction().getActionDef(),
    new TableChargerRebootAction().getActionDef(),
    new TableEditAction().getActionDef(),
    new TableDeleteAction().getActionDef()
  ]
}
@Injectable()
export class ChargingStationsFaultyDataSource extends TableDataSource<ChargerInError> {

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
    // Init
    this.initDataSource();
    this.setPollingInterval(POLL_INTERVAL);
    this.setStaticFilters([{ 'WithSite': true }]);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      if (!refreshAction) {
        // Show
        this.spinnerService.show();
      }
      // Get data
      this.centralServerService.getChargersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
          if (!refreshAction) {
            // Show
            this.spinnerService.hide();
          }
          this.formatErrorMessages(chargers.result);
          // Set number of records
          this.setTotalNumberOfRecords(chargers.count);
          // Update details status
          chargers.result.forEach(charger => {
            // At first filter out the connectors that are null
            charger.connectors = charger.connectors.filter(connector => connector != null);
            charger.connectors.forEach(connector => {
              connector.hasDetails = connector.activeTransactionID > 0;
            });
          });
          // Ok
          observer.next(chargers.result);
          observer.complete();
        }, (error) => {
          // Show
          this.spinnerService.hide();
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
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

  public buildTableDef(): TableDef {
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
        detailComponentName: ConnectorsErrorDetailComponent
      },
      rowFieldNameIdentifier: 'uniqueId'
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
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
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        class: 'action-cell text-left',
        isAngularComponent: true,
        angularComponentName: ErrorCodeDetailsComponent
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        sortable: true,
        formatter: (value) => {
          return this.translateService.instant(`chargers.errors.${value}.title`)
        }
      },
      {
        id: 'errorCodeDescription',
        name: 'errors.description',
        sortable: false,
        formatter: (value, row: ChargerInError) => {
          return this.translateService.instant(`chargers.errors.${row.errorCode}.description`)
        }
      }
    ];
  }

  private formatErrorMessages(chargersInError: ChargerInError[]) {
    chargersInError.forEach(chargerInError => {
      const path = `chargers.errors.${chargerInError.errorCode}`;
      const errorMessage = new ErrorMessage(`${path}.title`, {}, `${path}.description`, {}, `${path}.action`, {});
      switch (chargerInError.errorCode) {
        case 'missingSettings':
          errorMessage.actionParameters = {
            missingSettings: ChargingStations.getListOfMissingSettings(chargerInError).map((setting) => {
              return this.translateService.instant(setting.value);
            }).map(setting => `"${setting}"`).join(',').toString()
          };
          break;
      }
      chargerInError.errorMessage = errorMessage;
    });
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildTableRowActions(): TableActionDef[] {
    if (this.authorizationService.isAdmin()) {
      return [
        new TableChargerMoreAction().getActionDef(),
        new TableSettingsAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableSettingsAction().getActionDef()
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'reboot':
        this._simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({ type: 'Hard' }),
          this.translateService.instant('chargers.reboot_title'),
          this.translateService.instant('chargers.reboot_confirm', { 'chargeBoxID': rowItem.id }),
          this.translateService.instant('chargers.reboot_success', { 'chargeBoxID': rowItem.id }),
          'chargers.reset_error'
        );
        break;
      case 'soft_reset':
        this._simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({ type: 'Soft' }),
          this.translateService.instant('chargers.soft_reset_title'),
          this.translateService.instant('chargers.soft_reset_confirm', { 'chargeBoxID': rowItem.id }),
          this.translateService.instant('chargers.soft_reset_success', { 'chargeBoxID': rowItem.id }),
          'chargers.soft_reset_error'
        );
        break;
      case 'delete':
        this._deleteChargingStation(rowItem);
        break;
      case 'edit':
        this._showChargingStationDialog(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public onRowActionMenuOpen(action: TableActionDef, row: Charger) {
    action.dropdownItems.forEach(dropDownItem => {
      if (dropDownItem.id === ACTION_SMART_CHARGING) {
        // Check charging station version
        dropDownItem.disabled = row.ocppVersion === Constants.OCPP_VERSION_12 ||
          row.ocppVersion === Constants.OCPP_VERSION_15 ||
          row.inactive;
      } else {
        // Check active status of CS
        dropDownItem.disabled = row.inactive;
      }
    });
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const errorTypes = Object.keys(en.chargers.errors).map(key => ({ key: key, value: `chargers.errors.${key}.title` }));

    return [
      //      new ChargerTableFilter().getFilterDef(),
      new SitesTableFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef()
    ];
  }

  private _simpleActionChargingStation(action: string, charger: Charger, args, title, message, success_message, error_message) {
    if (charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        title,
        message
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          // Call REST service
          this.centralServerService.actionChargingStation(action, charger.id, args).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // Success + reload
              this.messageService.showSuccessMessage(success_message);
              this.loadDataAndFormat(true).subscribe();
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
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (chargingStation) {
      dialogConfig.data = chargingStation;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(ChargingStationSettingsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadDataAndFormat(true).subscribe());
  }

  private _deleteChargingStation(chargingStation: Charger) {
    if (chargingStation.connectors.findIndex(connector => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.delete_title'),
        this.translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.delete_title'),
        this.translateService.instant('chargers.delete_confirm', { 'chargeBoxID': chargingStation.id })
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          this.centralServerService.deleteChargingStation(chargingStation.id).subscribe(response => {
            if (response.status === Constants.REST_RESPONSE_SUCCESS) {
              this.loadDataAndFormat(true).subscribe();
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

  buildTableDynamicRowActions(charger: ChargerInError) {
    if (this.authorizationService.isAdmin()) {
      // duplicate actions from the map
      const actions = JSON.parse(JSON.stringify(ACTION_MAP[charger.errorCode]));
      // handle specific case for delete
      /*      actions.forEach((action: TableActionDef) => {
              if (action.id === 'delete') {
                action.disabled = charger.connectors.findIndex(connector => connector.activeTransactionID > 0) >= 0;
              }
            });*/
      return actions;
    } else {
      return [
      ];
    }
  }
}
