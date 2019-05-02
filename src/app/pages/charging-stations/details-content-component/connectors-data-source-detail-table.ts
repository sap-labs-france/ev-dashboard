import {TranslateService} from '@ngx-translate/core';
import {ActionResponse, Charger, Connector, TableActionDef, TableColumnDef, TableDef, User} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import {Router} from '@angular/router';
import {MessageService} from '../../../services/message.service';
import {DialogService} from '../../../services/dialog.service';
import {ConnectorStatusComponent} from '../cell-content-components/connector-status.component';
import {AppConnectorErrorCodePipe} from '../../../shared/formatters/app-connector-error-code.pipe';
import {ConnectorCellComponent} from '../cell-content-components/connector-cell.component';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {InstantPowerConnectorProgressBarComponent} from '../cell-content-components/instant-power-connector-progress-bar.component';
import {AuthorizationService} from '../../../services/authorization-service';
import {TableStartAction} from '../../../shared/table/actions/table-start-action';
import {TableStopAction} from '../../../shared/table/actions/table-stop-action';
import {TableNoAction} from '../../../shared/table/actions/table-no-action';
import {Utils} from '../../../utils/Utils';
import {Constants} from '../../../utils/Constants';
import {BUTTON_FOR_MYSELF, BUTTON_SELECT_USER, StartTransactionDialogComponent} from './start-transaction-dialog-component';
import {UsersDialogComponent} from '../../../shared/dialogs/users/users-dialog-component';
import {TableOpenAction} from '../../../shared/table/actions/table-open-action';
import {SessionDialogComponent} from '../../../shared/dialogs/session/session-dialog-component';
import {ConsumptionChartDetailComponent} from '../../../shared/component/transaction-chart/consumption-chart-detail.component';
import {TableDataSource} from 'app/shared/table/table-data-source';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';

@Injectable()
export class ConnectorsDataSource extends TableDataSource<Connector> {
  public stopAction = new TableStopAction();
  public startAction = new TableStartAction();
  public openAction = new TableOpenAction();
  public noAction = new TableNoAction();

  private charger: Charger;
  private dialogRefSession: MatDialogRef<SessionDialogComponent>;

  constructor(
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private appUnitPipe: AppUnitPipe,
      private dialog: MatDialog,
      private authorizationService: AuthorizationService,
      private messageService: MessageService,
      private router: Router,
      private dialogService: DialogService) {
    super();
    // Init
    this.initDataSource();
    this.noAction.getActionDef().disabled = true;
  }

  public loadData(): Observable<any> {
    return new Observable((observer) => {
      // Return connector
      if (this.charger) {
        // Check authorizations
        this.centralServerService.getIsAuthorized('ConnectorsAction', this.charger.id).subscribe((result) => {
          // Update authorization on individual connectors
          for (let index = 0; index < result.length; index++) {
            this.charger.connectors[index].isStopAuthorized = result[index].isStopAuthorized;
            this.charger.connectors[index].isStartAuthorized = result[index].isStartAuthorized;
            this.charger.connectors[index].isTransactionDisplayAuthorized =
            result[index].isTransactionDisplayAuthorized;
          }
          // Check connectors details status
          this.charger.connectors.forEach((connector: Connector) => {
            connector.hasDetails = false;
            // If user can stop transaction he can also see details except user demo that can also see details
            connector.hasDetails = connector.activeTransactionID > 0 &&
              (this.charger.connectors[connector.connectorId - 1].isStopAuthorized || this.authorizationService.isDemo());
          });
          // Respond
          this.setTotalNumberOfRecords(this.charger.connectors.length);
          observer.next(this.charger.connectors);
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
        angularComponent: ConnectorCellComponent
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center',
        class: '',
        isAngularComponent: true,
        angularComponent: ConnectorStatusComponent,
        sortable: false
      },
      {
        id: 'currentConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: InstantPowerConnectorProgressBarComponent,
        sortable: false
      },
      {
        id: 'totalConsumption',
        name: 'chargers.total_consumption_title',
        formatter: (value) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
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

  public getTableActionsDef(): TableActionDef[] {
    return super.getTableActionsDef();
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableDynamicRowActions(connector: Connector): TableActionDef[] {
    console.log(connector);
    console.log(this.charger);
    if (connector && !this.charger.inactive) {
      // Check active transaction
      if (connector.activeTransactionID) {
        // Authorized to stop?
        if (connector.isStopAuthorized) {
          return [
            this.openAction.getActionDef(),
            this.stopAction.getActionDef()
          ];
        // Display only?
        } else if (connector.isTransactionDisplayAuthorized) {
          return [
            this.openAction.getActionDef(),
          ];
        }
      // No Active Transaction
      } else {
        // Authorized to start?
        if (connector.isStartAuthorized) {
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

  specificRowActions(connector: Connector): TableActionDef[] {
    const actionAuthorize = [];
    if (connector && connector.activeTransactionID) {
      if (connector.isTransactionDisplayAuthorized) {
        actionAuthorize.push(new TableOpenAction().getActionDef());
      }
      if (connector.isStopAuthorized) {
        actionAuthorize.push(this.stopAction.getActionDef());
      }
    } else {
      if (connector.isStartAuthorized) {
        actionAuthorize.push(this.startAction.getActionDef());
      }
    }
    if (actionAuthorize.length > 0) {
      return actionAuthorize;
    } else {
      // No action
      return [
        this.noAction.getActionDef()
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, connector: Connector) {
    switch (actionDef.id) {
      case 'start':
        if ((connector.status === Constants.CONN_STATUS_AVAILABLE || connector.status === Constants.CONN_STATUS_PREPARING) &&
            !this.charger.inactive && connector.isStartAuthorized) {
          if (this.authorizationService.isAdmin()) {
            // Admin can start transaction for themself or any other user
            this.startTransactionAsAdmin(connector)
          } else {
            this.startTransaction(connector, this.centralServerService.getLoggedUser());
          }
        } else {
          if (connector.status !== Constants.CONN_STATUS_AVAILABLE) {
            this.dialogService.createAndShowOkDialog(
              this.translateService.instant('chargers.action_error.transaction_start_title'),
              this.translateService.instant('chargers.action_error.transaction_start_not_available'));
          } else if (this.charger.inactive) {
            this.dialogService.createAndShowOkDialog(
              this.translateService.instant('chargers.action_error.transaction_start_title'),
              this.translateService.instant('chargers.action_error.transaction_start_charger_inactive'));
          }
        }
        break;
      case 'open':
        if (connector && connector.activeTransactionID && connector.isTransactionDisplayAuthorized) {
          this.openSession(connector);
        } else {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized'));
        }
        break;
      case 'stop':
        // check authorization
        if (connector && connector.activeTransactionID && connector.isStopAuthorized) {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('chargers.stop_transaction_title'),
            this.translateService.instant('chargers.stop_transaction_confirm', {'chargeBoxID': this.charger.id})
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this.centralServerService.stationStopTransaction(
                this.charger.id, connector.activeTransactionID).subscribe((response2: ActionResponse) => {
                this.messageService.showSuccessMessage(
                  this.translateService.instant('chargers.stop_transaction_success', {'chargeBoxID': this.charger.id}));
              }, (error) => {
                Utils.handleHttpError(error, this.router, this.messageService,
                  this.centralServerService, 'chargers.stop_transaction_error');
              });
            }
          });
        } else {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.transaction_stop_not_authorized'));
        }
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
        this.centralServerService.stationStartTransaction(
            this.charger.id, connector.connectorId, user.tagIDs[0]).subscribe((response2: ActionResponse) => {
          // Ok
          this.messageService.showSuccessMessage(
            this.translateService.instant('chargers.start_transaction_success', {'chargeBoxID': this.charger.id}));
          // Reload
          this.refreshOrLoadData().subscribe();
          return true;
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
    const dialogRef = this.dialog.open(StartTransactionDialogComponent, dialogConfig);
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
          }
          const dialogRef2 = this.dialog.open(UsersDialogComponent, dialogConfig);
          // Add sites
          dialogRef2.afterClosed().subscribe(data => {
            if (data && data.length > 0) {
              return this.startTransaction(connector, data[0].objectRef)
            }
          });
          break;
        default:
          break;
      }
    })
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
    this.dialogRefSession.afterClosed().subscribe(() => this.refreshOrLoadData().subscribe());
  }
}
