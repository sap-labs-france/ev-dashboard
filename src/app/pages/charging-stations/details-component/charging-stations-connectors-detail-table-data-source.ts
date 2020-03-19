import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { ChargingStation, Connector, ConnStatus, OCPPGeneralResponse } from 'app/types/ChargingStation';
import { ActionResponse, DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { User, UserToken } from 'app/types/User';
import { Observable } from 'rxjs';
import { ChargingStationsConnectorInactivityCellComponent } from '../../../pages/charging-stations/cell-components/charging-stations-connector-inactivity-cell.component';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { TransactionDialogComponent } from '../../../shared/dialogs/transactions/transaction-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { AppConnectorErrorCodePipe } from '../../../shared/formatters/app-connector-error-code.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableNoAction } from '../../../shared/table/actions/table-no-action';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { TableStartAction } from '../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../shared/table/actions/table-stop-action';
import { Users } from '../../../utils/Users';
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

  private charger!: ChargingStation;
  private dialogRefSession!: MatDialogRef<TransactionDialogComponent>;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private appUnitPipe: AppUnitPipe,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
    this.noAction.getActionDef().disabled = true;
  }

  loadData(showSpinner: boolean = false): Observable<void> {
    return super.loadData(showSpinner);
  }

  public loadDataImpl(): Observable<DataResult<Connector>> {
    return new Observable((observer) => {
      // Return connector
      if (this.charger) {
        this.charger.connectors.forEach((connector) => {
          // tslint:disable-next-line:max-line-length
          connector.isStopAuthorized = !!connector.activeTransactionID && this.authorizationService.canStopTransaction(this.charger.siteArea, connector.activeTagID);
          // tslint:disable-next-line:max-line-length
          connector.isStartAuthorized = !connector.activeTransactionID && this.authorizationService.canStartTransaction(this.charger.siteArea);
          // tslint:disable-next-line:max-line-length
          connector.isTransactionDisplayAuthorized = this.authorizationService.canReadTransaction(this.charger.siteArea, connector.activeTagID);
          connector.hasDetails = !!connector.activeTransactionID && connector.isTransactionDisplayAuthorized;
        });

        observer.next({
          count: this.charger.connectors.length,
          result: this.charger.connectors,
        });
      }
      observer.complete();
    });
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
        showDetailsField: 'hasDetails',
      },
      rowFieldNameIdentifier: 'connectorId',
      isSimpleTable: true,
      design: {
        flat: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        sortable: false,
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorCellComponent,
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center',
        class: 'table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorStatusCellComponent,
        sortable: false,
      },
      {
        id: 'currentConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerConnectorProgressBarCellComponent,
        sortable: false,
      },
      {
        id: 'totalConsumption',
        name: 'chargers.total_consumption_title',
        formatter: (value: number) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
        sortable: false,
      },
      {
        id: 'totalInactivitySecs',
        name: 'chargers.inactivity',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorInactivityCellComponent,
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        formatter: (errorCode: string, row: Connector) => this.formatError(errorCode, row.info, row.vendorErrorCode),
        sortable: false,
      },
    ];
  }

  public formatError(errorCode: string, info: string | undefined, vendorErrorCode: string | undefined) {
    const _errorCode = new AppConnectorErrorCodePipe(this.translateService).transform(errorCode);
    const _info = info && info !== '' ? ` > ${info}` : '';
    const _vendorErrorCode = vendorErrorCode && vendorErrorCode !== '' ? ` (${vendorErrorCode})` : '';
    return `${_errorCode}${_info}${_vendorErrorCode}`;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(connector: Connector): TableActionDef[] {
    const actions = [];
    if (connector) {
      if (connector.isTransactionDisplayAuthorized) {
        actions.push(this.openAction.getActionDef());
      }
      if (connector.isStopAuthorized) {
        actions.push(this.stopAction.getActionDef());
      }
      if (connector.isStartAuthorized && !this.charger.inactive) {
        actions.push(this.startAction.getActionDef());
      }
    }
    if (actions.length > 0) {
      return actions;
    }
    // By default no actions
    return [
      this.noAction.getActionDef(),
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, connector: Connector) {
    switch (actionDef.id) {
      // Start Transaction
      case ButtonAction.START:
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
        if (connector.status === ConnStatus.UNAVAILABLE) {
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
          this.startTransaction(connector, null, this.centralServerService.getLoggedUser());
        }
        break;

      // Open Transaction
      case ButtonAction.OPEN:
        // Check
        if (!connector.isTransactionDisplayAuthorized) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized'));
          return;
        }
        // Show
        this.openSession(connector);
        break;

      // Stop Transaction
      case ButtonAction.STOP:
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
        if (connector.status === ConnStatus.UNAVAILABLE) {
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
          this.translateService.instant('chargers.stop_transaction_confirm', { chargeBoxID: this.charger.id }),
        ).subscribe((response) => {
          if (response === ButtonType.YES) {
            this.centralServerService.chargingStationStopTransaction(
              this.charger.id, connector.activeTransactionID).subscribe((response2: ActionResponse) => {
              // Ok?
              if (response2.status === OCPPGeneralResponse.ACCEPTED) {
                this.messageService.showSuccessMessage(
                  this.translateService.instant('chargers.stop_transaction_success', { chargeBoxID: this.charger.id }));
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
    }
  }

  public startTransaction(connector: Connector, user: User | null, loggedUser: UserToken): void {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.start_transaction_title'),
      this.translateService.instant('chargers.start_transaction_confirm', {
        chargeBoxID: this.charger.id,
        userName: Users.buildUserFullName(user ? user : loggedUser),
      }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        // To DO a selection of the badge to use??
        let tagId;
        if (user) {
          if (user.tags.find((value) => value.active === true)) {
            tagId = user.tags.find((value) => value.active === true).id;
          }
        } else if (loggedUser.tagIDs && loggedUser.tagIDs.length > 0) {
          tagId = loggedUser.tagIDs[0];
        }

        if (!tagId) {
          this.messageService.showSuccessMessage(
            this.translateService.instant('chargers.start_transaction_missing_active_tag', {
              chargeBoxID: this.charger.id,
              userName: Users.buildUserFullName(user ? user : loggedUser),
            }));
          return;
        }
        this.centralServerService.chargingStationStartTransaction(
          this.charger.id, connector.connectorId, tagId).subscribe((startTransactionResponse: ActionResponse) => {
          // Ok?
          if (startTransactionResponse.status === OCPPGeneralResponse.ACCEPTED) {
            // Ok
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.start_transaction_success', { chargeBoxID: this.charger.id }));
            // Reload
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.start_transaction_error'));
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.start_transaction_error');
        });
      }
    });
  }

  private startTransactionAsAdmin(connector: Connector): void {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = '';
    // Set data
    dialogConfig.data = {
      title: 'chargers.start_transaction_admin_title',
      message: 'chargers.start_transaction_admin_message',
    };
    // Show
    const dialogRef = this.dialog.open(ChargingStationsStartTransactionDialogComponent, dialogConfig);
    // Register
    dialogRef.afterClosed().subscribe((buttonId) => {
      switch (buttonId) {
        case BUTTON_FOR_MYSELF:
          return this.startTransaction(connector, null, this.centralServerService.getLoggedUser());
        case BUTTON_SELECT_USER:
          // Show select user dialog
          dialogConfig.data = {
            title: 'chargers.start_transaction_user_select_title',
            validateButtonTitle: 'chargers.start_transaction_user_select_button',
            rowMultipleSelection: false,
          };
          dialogConfig.panelClass = 'transparent-dialog-container';
          const dialogRef2 = this.dialog.open(UsersDialogComponent, dialogConfig);
          // Add sites
          dialogRef2.afterClosed().subscribe((data) => {
            if (data && data.length > 0) {
              return this.startTransaction(connector, data[0].objectRef, this.centralServerService.getLoggedUser());
            }
          });
          break;
        default:
          break;
      }
    });
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
      chargingStationId: this.charger.id,
      connector,
    };
    // Open
    this.dialogRefSession = this.dialog.open(TransactionDialogComponent, dialogConfig);
    this.dialogRefSession.afterClosed().subscribe(() => this.refreshData().subscribe());
  }
}
