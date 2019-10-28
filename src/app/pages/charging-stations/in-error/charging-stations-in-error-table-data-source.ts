import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Charger, ChargerInError, Connector, DataResult, DropdownItem, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/common.types';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { ComponentType, ComponentService } from '../../../services/component.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { ErrorMessage } from '../../../shared/dialogs/error-code-details/error-code-details-dialog.component';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { ChargingStations } from '../../../utils/ChargingStations';
import { ACTION_SMART_CHARGING } from '../actions/charging-stations-more-action';
import { ChargingStationsRebootAction } from '../actions/charging-stations-reboot-action';
import { ChargingStationsResetAction } from '../actions/charging-stations-reset-action';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationSettingsComponent } from '../charging-station/settings/charging-station-settings.component';

@Injectable()
export class ChargingStationsInErrorTableDataSource extends TableDataSource<ChargerInError> {
  private isAdmin: boolean;
  private actions = {
    missingSettings: [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef(),
    ],
    missingSiteArea: [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef(),
    ],
    connectionBroken: [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef(),
    ],
    connectorError: [
      new ChargingStationsResetAction().getActionDef(),
      new ChargingStationsRebootAction().getActionDef(),
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef(),
    ],
  };
  private isOrganizationComponentActive: boolean;

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
    private dialogService: DialogService) {
    super(spinnerService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.isOrganizationComponentActive = this.componentService.isActive(ComponentType.ORGANIZATION);

    if (this.isOrganizationComponentActive) {
      this.setStaticFilters(
        [
          {WithSite: true},
        ]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadDataImpl(): Observable<DataResult<ChargerInError>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
        this.formatErrorMessages(chargers.result);
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

  public getConnectors(id): Observable<Connector> {
    this.getData().forEach((charger) => {
      if (charger.id === id) {
        return charger;
      }
    });
    return null;
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
      rowFieldNameIdentifier: 'uniqueId',
      hasDynamicRowAction: true,
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
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        class: 'action-cell text-left',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        sortable: true,
        formatter: (value) => this.translateService.instant(`chargers.errors.${value}.title`),
      },
      {
        id: 'errorCodeDescription',
        name: 'errors.description',
        sortable: false,
        formatter: (value, row: ChargerInError) => this.translateService.instant(`chargers.errors.${row.errorCode}.description`),
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
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
        this.simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({type: 'Hard'}),
          this.translateService.instant('chargers.reboot_title'),
          this.translateService.instant('chargers.reboot_confirm', {chargeBoxID: rowItem.id}),
          this.translateService.instant('chargers.reboot_success', {chargeBoxID: rowItem.id}),
          'chargers.reset_error',
        );
        break;
      case 'soft_reset':
        this.simpleActionChargingStation('ChargingStationReset', rowItem, JSON.stringify({type: 'Soft'}),
          this.translateService.instant('chargers.soft_reset_title'),
          this.translateService.instant('chargers.soft_reset_confirm', {chargeBoxID: rowItem.id}),
          this.translateService.instant('chargers.soft_reset_success', {chargeBoxID: rowItem.id}),
          'chargers.soft_reset_error',
        );
        break;
      case 'delete':
        this.deleteChargingStation(rowItem);
        break;
      case 'edit':
        this.showChargingStationDialog(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public onRowActionMenuOpen(action: TableActionDef, row: Charger) {
    action.dropdownItems.forEach((dropDownItem) => {
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
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: Constants.CHARGER_IN_ERROR_MISSING_SETTINGS,
      value: `chargers.errors.${Constants.CHARGER_IN_ERROR_MISSING_SETTINGS}.title`,
    });
    errorTypes.push({
      key: Constants.CHARGER_IN_ERROR_CONNECTION_BROKEN,
      value: `chargers.errors.${Constants.CHARGER_IN_ERROR_CONNECTION_BROKEN}.title`,
    });
    errorTypes.push({
      key: Constants.CHARGER_IN_ERROR_CONNECTOR_ERROR,
      value: `chargers.errors.${Constants.CHARGER_IN_ERROR_CONNECTOR_ERROR}.title`,
    });
    if (this.isOrganizationComponentActive) {
      errorTypes.push({
      key: Constants.CHARGER_IN_ERROR_MISSING_SITE_AREA,
      value: `chargers.errors.${Constants.CHARGER_IN_ERROR_MISSING_SITE_AREA}.title`,
      });
    }
    // Sort
    errorTypes.sort((errorType1, errorType2) => {
      if (errorType1.value < errorType2.value) {
        return -1;
      }
      if (errorType1.value > errorType2.value) {
        return 1;
      }
      return 0;
    });

    if (this.isOrganizationComponentActive) {
      return [
        new SiteTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
        new ErrorTypeTableFilter(errorTypes).getFilterDef(),
      ];
    }
    return [
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];
  }

  buildTableDynamicRowActions(charger: ChargerInError) {
    if (this.isAdmin) {
      return this.actions[charger.errorCode];
    } else {
      return [];
    }
  }

  private formatErrorMessages(chargersInError: ChargerInError[]) {
    chargersInError.forEach((chargerInError) => {
      const path = `chargers.errors.${chargerInError.errorCode}`;
      const errorMessage = new ErrorMessage(`${path}.title`, {}, `${path}.description`, {}, `${path}.action`, {});
      switch (chargerInError.errorCode) {
        case 'missingSettings':
          errorMessage.actionParameters = {
            missingSettings: ChargingStations.getListOfMissingSettings(chargerInError).map((setting) => {
              return this.translateService.instant(setting.value);
            }).map((setting) => `"${setting}"`).join(',').toString(),
          };
          break;
      }
      chargerInError.errorMessage = errorMessage;
    });
  }

  private simpleActionChargingStation(action: string, charger: Charger, args, title, message, successMessage, errorMessage) {
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

  private showChargingStationDialog(chargingStation?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
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

  private deleteChargingStation(chargingStation: Charger) {
    if (chargingStation.connectors.findIndex((connector) => connector.activeTransactionID > 0) >= 0) {
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
}
