import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';

import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';
import { ReservationButtonAction } from 'types/Reservation';
import {
  TableChargingStationsCreateReservationAction,
  TableChargingStationsCreateReservationActionDef,
} from 'shared/table/actions/charging-stations/table-charging-stations-create-reservation-action';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import {
  TableChargingStationsReserveNowAction,
  TableChargingStationsReserveNowActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-reserve-now-action';
import {
  TableChargingStationsCancelReservationAction,
  TableChargingStationsCancelReservationActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-cancel-reservation-action';
import {
  TableChargingStationsStartTransactionAction,
  TableChargingStationsStartTransactionActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-start-transaction-action';
import {
  TableChargingStationsStopTransactionAction,
  TableChargingStationsStopTransactionActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-stop-transaction-action';
import {
  TableChargingStationsUnlockConnectorAction,
  TableChargingStationsUnlockConnectorActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-unlock-connector-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableNoAction } from '../../../shared/table/actions/table-no-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableViewTransactionAction,
  TableViewTransactionActionDef,
  TransactionDialogData,
} from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import {
  ChargingStation,
  ChargingStationButtonAction,
  Connector,
} from '../../../types/ChargingStation';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef } from '../../../types/Table';
import { TransactionButtonAction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorCellComponent } from '../cell-components/charging-stations-connector-cell.component';
import { ChargingStationsConnectorInactivityCellComponent } from '../cell-components/charging-stations-connector-inactivity-cell.component';
import { ChargingStationsConnectorStatusCellComponent } from '../cell-components/charging-stations-connector-status-cell.component';
import { ChargingStationsInstantPowerConnectorProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { ChargingStationsStartTransactionDialogComponent } from '../charging-station-start-transaction/charging-stations-start-transaction-dialog-component';
import { ChargingStationsReserveNowDialogComponent } from '../charging-station-reserve-now/charging-stations-reserve-now-dialog-component';
import { ChargingStationCreateReservationDialogComponent } from '../charging-station-create-reservation/charging-station-create-reservation-dialog-component';

@Injectable()
export class ChargingStationConnectorsTableDataSource extends TableDataSource<Connector> {
  public stopTransactionAction = new TableChargingStationsStopTransactionAction().getActionDef();
  public startTransactionAction = new TableChargingStationsStartTransactionAction().getActionDef();
  public reserveNowAction = new TableChargingStationsReserveNowAction().getActionDef();
  public cancelReservationAction =
    new TableChargingStationsCancelReservationAction().getActionDef();
  public unlockConnectorAction = new TableChargingStationsUnlockConnectorAction().getActionDef();
  public viewTransactionAction = new TableViewTransactionAction().getActionDef();
  public noAction = new TableNoAction().getActionDef();
  public createReservationAction =
    new TableChargingStationsCreateReservationAction().getActionDef();
  private readonly isReservationComponentActive: boolean;

  private chargingStation!: ChargingStation;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private appUnitPipe: AppUnitPipe,
    private dialog: MatDialog,
    private appUserNamePipe: AppUserNamePipe,
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService,
    private componentService: ComponentService
  ) {
    super(spinnerService, translateService);
    // Init
    this.isReservationComponentActive = this.componentService.isActive(
      TenantComponents.RESERVATION
    );
    this.initDataSource();
    this.noAction.disabled = true;
  }

  public loadData(showSpinner: boolean = false): Observable<void> {
    return super.loadData(showSpinner);
  }

  public loadDataImpl(): Observable<DataResult<Connector>> {
    return new Observable((observer) => {
      // Return connector
      if (this.chargingStation) {
        // Rebuild projected fields for Connector
        let connectorsProjectedFields = this.additionalParameters.projectFields.filter(
          (projectField) => projectField.startsWith('connectors.')
        );
        connectorsProjectedFields = connectorsProjectedFields.map((connectorsProjectedField) => {
          if (connectorsProjectedField.startsWith('connectors.')) {
            return connectorsProjectedField.substring(11);
          }
        });
        for (const connector of this.chargingStation.connectors) {
          connector.hasDetails = !!connector.currentTransactionID && connector.canReadTransaction;
        }
        observer.next({
          count: this.chargingStation.connectors.length,
          result: this.chargingStation.connectors,
          projectFields: connectorsProjectedFields,
        });
      }
      observer.complete();
    });
  }

  public setChargingStation(chargingStation: ChargingStation) {
    this.chargingStation = chargingStation;
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
        headerClass: 'text-center col-20p',
        class: 'text-center table-cell-angular-big-component col-20p',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorCellComponent,
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center col-10em',
        class: 'table-cell-angular-big-component col-10em',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorStatusCellComponent,
      },
      {
        id: 'info',
        name: 'chargers.connector_info_title',
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        formatter: (info: string, row: Connector) => Utils.buildConnectorInfo(row),
      },
      {
        id: 'currentInstantWatts',
        name: 'chargers.consumption_title',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerConnectorProgressBarCellComponent,
      },
      {
        id: 'currentTotalConsumptionWh',
        name: 'chargers.total_consumption_title',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (value: number) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
      },
      {
        id: 'currentTotalInactivitySecs',
        name: 'chargers.inactivity',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorInactivityCellComponent,
      },
      {
        id: 'user.name',
        name: 'chargers.user',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        formatter: (name: string, connector: Connector) =>
          this.appUserNamePipe.transform(connector.user),
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(connector: Connector): TableActionDef[] {
    const rowActions = [];
    if (connector) {
      if (connector.canReadTransaction) {
        rowActions.push(this.viewTransactionAction);
      }
      if (connector.canRemoteStopTransaction) {
        rowActions.push(this.stopTransactionAction);
      }
      if (connector.canRemoteStartTransaction) {
        rowActions.push(this.startTransactionAction);
      }
      if (connector.canUnlockConnector) {
        rowActions.push(this.unlockConnectorAction);
      }
      if (this.isReservationComponentActive) {
        rowActions.push({ ...this.createReservationAction, icon: 'book' });
      } else if (connector.canReserveNow) {
        rowActions.push(this.reserveNowAction);
      }
      if (connector.canCancelReservation) {
        rowActions.push(this.cancelReservationAction);
      }
    }
    if (!Utils.isEmptyArray(rowActions)) {
      return rowActions;
    }
    // By default no actions
    return [this.noAction];
  }

  public rowActionTriggered(actionDef: TableActionDef, connector: Connector) {
    switch (actionDef.id) {
      // Start Transaction
      case ChargingStationButtonAction.START_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableChargingStationsStartTransactionActionDef).action(
            ChargingStationsStartTransactionDialogComponent,
            this.chargingStation,
            connector,
            this.dialogService,
            this.dialog,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      // Stop Transaction
      case ChargingStationButtonAction.STOP_TRANSACTION:
        this.centralServerService.getTransaction(connector.currentTransactionID).subscribe({
          next: (transaction) => {
            if (actionDef.action) {
              (actionDef as TableChargingStationsStopTransactionActionDef).action(
                transaction,
                this.dialogService,
                this.translateService,
                this.messageService,
                this.centralServerService,
                this.spinnerService,
                this.router,
                this.refreshData.bind(this)
              );
            }
          },
          error: (error) => {
            this.messageService.showErrorMessage('transactions.transaction_id_not_found', {
              sessionID: connector.currentTransactionID,
            });
          },
        });
        break;
      // View Transaction
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (!connector.canReadTransaction) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized')
          );
          return;
        }
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(
            TransactionDialogComponent,
            this.dialog,
            {
              dialogData: {
                transactionID: connector.currentTransactionID,
                chargingStationID: this.chargingStation.id,
                connectorID: connector.connectorId,
              } as TransactionDialogData,
            },
            this.refreshData.bind(this)
          );
        }
        break;
      // Unlock Charger
      case ChargingStationButtonAction.UNLOCK_CONNECTOR:
        if (actionDef.action) {
          (actionDef as TableChargingStationsUnlockConnectorActionDef).action(
            connector,
            this.chargingStation,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.RESERVE_NOW:
        if (actionDef.action) {
          (actionDef as TableChargingStationsReserveNowActionDef).action(
            ChargingStationsReserveNowDialogComponent,
            this.chargingStation,
            connector,
            this.dialogService,
            this.dialog,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.CANCEL_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableChargingStationsCancelReservationActionDef).action(
            this.chargingStation,
            connector,
            { id: connector.reservationID },
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ReservationButtonAction.CREATE_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableChargingStationsCreateReservationActionDef).action(
            ChargingStationCreateReservationDialogComponent,
            this.chargingStation,
            connector,
            this.dialogService,
            this.dialog,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }
}
