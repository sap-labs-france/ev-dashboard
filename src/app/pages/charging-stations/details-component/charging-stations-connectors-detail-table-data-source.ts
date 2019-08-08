import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Observable } from 'rxjs';
import { ActionResponse, Charger, Connector, TableActionDef, TableColumnDef, TableDef, User } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { SessionDialogComponent } from '../../../shared/dialogs/session/session-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { AppConnectorErrorCodePipe } from '../../../shared/formatters/app-connector-error-code.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableNoAction } from '../../../shared/table/actions/table-no-action';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { TableStartAction } from '../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../shared/table/actions/table-stop-action';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorCellComponent } from '../cell-components/charging-stations-connector-cell.component';
import { ChargingStationsConnectorStatusCellComponent } from '../cell-components/charging-stations-connector-status-cell.component';
import { ChargingStationsInstantPowerConnectorProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { BUTTON_FOR_MYSELF, BUTTON_SELECT_USER, ChargingStationsStartTransactionDialogComponent } from './charging-stations-start-transaction-dialog-component';

@Injectable()
export class ChargingStationsConnectorsDetailTableDataSource extends TableDataSource<Connector> {
  public stopAction = new TableStopAction();
  public startAction = new TableStartAction();
  public openAction = new TableOpenAction();
  public noAction = new TableNoAction();

  private charger: Charger;
  private dialogRefSession: MatDialogRef<SessionDialogComponent>;

  constructor(
      public spinnerService: SpinnerService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private appUnitPipe: AppUnitPipe,
      private appDurationPipe: AppDurationPipe,
      private dialog: MatDialog,
      private authorizationService: AuthorizationService,
      private messageService: MessageService,
      private router: Router,
      private dialogService: DialogService) {
    super(spinnerService);
    // Init
    this.initDataSource();
    this.noAction.getActionDef().disabled = true;
  }

  loadData(showSpinner: boolean = false): Observable<Connector> {
    return super.loadData(showSpinner);
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Return connector
      if (this.charger) {
        // Check authorizations
        this.centralServerService.getIsAuthorized('ConnectorsAction', this.charger.id).subscribe((result) => {
          // Update authorization on individual connectors
          for (let index = 0; index < result.length; index++) {
            const connector = this.charger.connectors[index];
            connector.isStopAuthorized = result[index].isStopAuthorized;
            connector.isStartAuthorized = result[index].isStartAuthorized;
            connector.isTransactionDisplayAuthorized = result[index].isTransactionDisplayAuthorized;
            connector.hasDetails = connector.activeTransactionID > 0 &&
              (connector.isTransactionDisplayAuthorized || this.authorizationService.isDemo());
          }
          observer.next({
            count: this.charger.connectors.length,
            result: this.charger.connectors
          });
          observer.complete();
        }, (error) => {
          // Authorization issue!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
      }
    });
  }

  public setCharger(charger: Charger) {
    this.charger = charger;
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
        showDetailsField: 'hasDetails'
      },
      rowFieldNameIdentifier: 'connectorId',
      isSimpleTable: true,
      design: {
        flat: true
      },
      hasDynamicRowAction: true
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        sortable: false,
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorCellComponent
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center',
        class: '',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorStatusCellComponent,
        sortable: false
      },
      {
        id: 'currentConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerConnectorProgressBarCellComponent,
        sortable: false
      },
      {
        id: 'totalConsumption',
        name: 'chargers.total_consumption_title',
        formatter: (value) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
        sortable: false
      },
      {
        id: 'totalInactivitySecs',
        name: 'chargers.inactivity',
        formatter: (totalInactivitySecs) => this.appDurationPipe.transform(totalInactivitySecs),
        sortable: false
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        formatter: (errorCode, row) => this.formatError(errorCode, row.info, row.vendorErrorCode),
        sortable: false
      }
    ];
  }

  public formatError(errorCode, info, vendorErrorCode) {
    const _errorCode = new AppConnectorErrorCodePipe(this.translateService).transform(errorCode);
    const _info = info && info !== '' ? ` > ${info}` : '';
    const _vendorErrorCode = vendorErrorCode && vendorErrorCode !== '' ? ` (${vendorErrorCode})` : '';
    return `${_errorCode}${_info}${_vendorErrorCode}`;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableDynamicRowActions(connector: Connector): TableActionDef[] {
    if (connector) {
      // Check active transaction
      if (connector.activeTransactionID) {
        // Authorized to stop?
        if (connector.isStopAuthorized) {
          if (!this.charger.inactive) {
            return [
              this.openAction.getActionDef(),
              this.stopAction.getActionDef()
            ];
          } else {
            return [
              this.openAction.getActionDef(),
            ];
          }
        // Display only?
        } else if (connector.isTransactionDisplayAuthorized) {
          return [
            this.openAction.getActionDef(),
          ];
        }
      // No Active Transaction
      } else {
        // Authorized to start?
        if (connector.isStartAuthorized && !this.charger.inactive) {
          // By default no actions
          return [
            this.startAction.getActionDef()
          ];
        }
      }
    }
    // By default no actions
    return [
      this.noAction.getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, connector: Connector) {
    switch (actionDef.id) {
      // Start Transaction
      case 'start':
        if (!connector.isStartAuthorized) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_start_title'),
            this.translateService.instant('chargers.action_error.transaction_start_not_authorized'));
          return;
        }
        if (this.charger.inactive) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_start_title'),
            this.translateService.instant('chargers.action_error.transaction_start_charger_inactive'));
          return;
        }
        if (connector.status === Constants.CONN_STATUS_UNAVAILABLE) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_start_title'),
            this.translateService.instant('chargers.action_error.transaction_start_not_available'));
          return;
        }
        if (connector.activeTransactionID) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_start_title'),
            this.translateService.instant('chargers.action_error.transaction_in_progress'));
            return;
        }
        // Check
        if (this.authorizationService.isAdmin()) {
          this.startTransactionAsAdmin(connector);
        } else {
          this.startTransaction(connector, this.centralServerService.getLoggedUser());
        }
        break;

      // Open Transaction
      case 'open':
        // Check
        if (!connector.isTransactionDisplayAuthorized) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized'));
        }
        if (!connector.activeTransactionID) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.no_active_transaction'));
        }
        // Show
        this.openSession(connector);
        break;

      // Stop Transaction
      case 'stop':
        if (!connector.isStopAuthorized) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.transaction_stop_not_authorized'));
        }
        if (this.charger.inactive) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.transaction_stop_charger_inactive'));
          return;
        }
        if (connector.status === Constants.CONN_STATUS_UNAVAILABLE) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.transaction_stop_not_available'));
          return;
        }
        if (!connector.activeTransactionID) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.no_active_transaction'));
        }
        // Check authorization
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('chargers.stop_transaction_title'),
          this.translateService.instant('chargers.stop_transaction_confirm', {'chargeBoxID': this.charger.id})
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.centralServerService.chargingStationStopTransaction(
                this.charger.id, connector.activeTransactionID).subscribe((response2: ActionResponse) => {
              // Ok?
              if (response2.status === Constants.OCPP_RESPONSE_ACCEPTED) {
                this.messageService.showSuccessMessage(
                  this.translateService.instant('chargers.stop_transaction_success', {'chargeBoxID': this.charger.id}));
              } else {
                Utils.handleError(JSON.stringify(response),
                  this.messageService, this.translateService.instant('chargers.stop_transaction_error'));
              }
            }, (error) => {
              Utils.handleHttpError(error, this.router, this.messageService,
                this.centralServerService, 'chargers.stop_transaction_error');
            });
          }
        });
        break;

      case 'more':
        break;
      default:
    }
  }

  public startTransaction(connector: Connector, user: User): boolean {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.start_transaction_title'),
      this.translateService.instant('chargers.start_transaction_confirm', {'chargeBoxID': this.charger.id, 'userName': user.name})
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        // To DO a selection of the badge to use??
        this.centralServerService.chargingStationStartTransaction(
            this.charger.id, connector.connectorId, user.tagIDs[0]).subscribe((response2: ActionResponse) => {
          // Ok?
          if (response2.status === Constants.OCPP_RESPONSE_ACCEPTED) {
            // Ok
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.start_transaction_success', {'chargeBoxID': this.charger.id}));
            // Reload
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.start_transaction_error'));
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.start_transaction_error');
          return false;
        });
      }
      return false;
    });
    return false;
  }

  private startTransactionAsAdmin(connector: Connector): boolean {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = '';
    // Set data
    dialogConfig.data = {
      title: 'chargers.start_transaction_admin_title',
      message: 'chargers.start_transaction_admin_message'
    };
    // Show
    const dialogRef = this.dialog.open(ChargingStationsStartTransactionDialogComponent, dialogConfig);
    // Register
    dialogRef.afterClosed().subscribe((buttonId) => {
      switch (buttonId) {
        case BUTTON_FOR_MYSELF:
          return this.startTransaction(connector, this.centralServerService.getLoggedUser());
        case BUTTON_SELECT_USER:
          // Show select user dialog
          dialogConfig.data = {
            title: 'chargers.start_transaction_user_select_title',
            validateButtonTitle: 'chargers.start_transaction_user_select_button'
          };
          dialogConfig.panelClass = 'transparent-dialog-container';
          const dialogRef2 = this.dialog.open(UsersDialogComponent, dialogConfig);
          // Add sites
          dialogRef2.afterClosed().subscribe(data => {
            if (data && data.length > 0) {
              return this.startTransaction(connector, data[0].objectRef);
            }
          });
          break;
        default:
          break;
      }
    });
    return false;
  }

  private openSession(connector: Connector) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: connector.activeTransactionID,
      siteArea: this.charger.siteArea,
      connector: connector,
    };
    // Open
    this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
    this.dialogRefSession.afterClosed().subscribe(() => this.refreshData().subscribe());
  }
}
