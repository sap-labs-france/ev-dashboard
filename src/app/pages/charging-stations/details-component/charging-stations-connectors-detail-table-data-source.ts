import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableViewTransactionAction } from 'app/pages/transactions/table-actions/table-view-transaction-action';
import { TransactionDialogComponent } from 'app/pages/transactions/transaction/transaction.dialog.component';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { ChargingStation, ChargingStationButtonAction, Connector } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { Observable } from 'rxjs';

import { ChargingStationsConnectorInactivityCellComponent } from '../../../pages/charging-stations/cell-components/charging-stations-connector-inactivity-cell.component';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppConnectorErrorCodePipe } from '../../../shared/formatters/app-connector-error-code.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableNoAction } from '../../../shared/table/actions/table-no-action';
import { ChargingStationsConnectorCellComponent } from '../cell-components/charging-stations-connector-cell.component';
import { ChargingStationsConnectorStatusCellComponent } from '../cell-components/charging-stations-connector-status-cell.component';
import { ChargingStationsInstantPowerConnectorProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { TableChargingStationsStartTransactionAction } from '../table-actions/table-charging-stations-start-transaction-action';
import { TableChargingStationsStopTransactionAction } from '../table-actions/table-charging-stations-stop-transaction-action';

@Injectable()
export class ChargingStationsConnectorsDetailTableDataSource extends TableDataSource<Connector> {
  public stopTransactionAction = new TableChargingStationsStopTransactionAction().getActionDef();
  public startTransactionAction = new TableChargingStationsStartTransactionAction().getActionDef();
  public viewTransactionAction = new TableViewTransactionAction().getActionDef();
  public noAction = new TableNoAction().getActionDef();

  private chargingStation!: ChargingStation;

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
    this.noAction.disabled = true;
  }

  public loadData(showSpinner: boolean = false): Observable<void> {
    return super.loadData(showSpinner);
  }

  public loadDataImpl(): Observable<DataResult<Connector>> {
    return new Observable((observer) => {
      // Return connector
      if (this.chargingStation) {
        this.chargingStation.connectors.forEach((connector) => {
          // tslint:disable-next-line:max-line-length
          connector.isStopAuthorized = !!connector.activeTransactionID && this.authorizationService.canStopTransaction(this.chargingStation.siteArea, connector.activeTagID);
          // tslint:disable-next-line:max-line-length
          connector.isStartAuthorized = !connector.activeTransactionID && this.authorizationService.canStartTransaction(this.chargingStation.siteArea);
          // tslint:disable-next-line:max-line-length
          connector.isTransactionDisplayAuthorized = this.authorizationService.canReadTransaction(this.chargingStation.siteArea, connector.activeTagID);
          connector.hasDetails = !!connector.activeTransactionID && connector.isTransactionDisplayAuthorized;
        });

        observer.next({
          count: this.chargingStation.connectors.length,
          result: this.chargingStation.connectors,
        });
      }
      observer.complete();
    });
  }

  public setCharger(charger: ChargingStation) {
    this.chargingStation = charger;
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
        headerClass: 'text-center col-30p',
        class: 'text-center table-cell-angular-big-component col-30p',
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
        sortable: false,
      },
      {
        id: 'currentConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center col-30p',
        class: 'text-center col-30p',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerConnectorProgressBarCellComponent,
        sortable: false,
      },
      {
        id: 'totalConsumption',
        name: 'chargers.total_consumption_title',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (value: number) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
        sortable: false,
      },
      {
        id: 'totalInactivitySecs',
        name: 'chargers.inactivity',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorInactivityCellComponent,
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        headerClass: 'col-15em',
        class: 'col-15em',
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
        actions.push(this.viewTransactionAction);
      }
      if (connector.isStopAuthorized) {
        actions.push(this.stopTransactionAction);
      }
      if (connector.isStartAuthorized && !this.chargingStation.inactive) {
        actions.push(this.startTransactionAction);
      }
    }
    if (actions.length > 0) {
      return actions;
    }
    // By default no actions
    return [
      this.noAction,
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, connector: Connector) {
    switch (actionDef.id) {
      // Start Transaction
      case ChargingStationButtonAction.START_TRANSACTION:
        if (actionDef.action) {
          actionDef.action(this.chargingStation, connector, this.authorizationService, this.dialogService, this.dialog,
            this.translateService, this.messageService, this.centralServerService, this.spinnerService,
            this.router, this.refreshData.bind(this));
        }
        break;
      // Stop Transaction
      case ChargingStationButtonAction.STOP_TRANSACTION:
        this.centralServerService.getTransaction(connector.activeTransactionID).subscribe((transaction) => {
          if (actionDef.action) {
            actionDef.action(transaction, this.authorizationService, this.dialogService,
              this.translateService, this.messageService, this.centralServerService, this.spinnerService,
              this.router, this.refreshData.bind(this));
          }
        }, (error) => {
          this.messageService.showErrorMessage('transactions.transaction_id_not_found', {sessionID: connector.activeTransactionID});
        });
        break;
      // View Transaction
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (!connector.isTransactionDisplayAuthorized) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized'));
          return;
        }
        if (actionDef.action) {
          actionDef.action({
            transactionID: connector.activeTransactionID,
            chargingStationID: this.chargingStation.id,
            connectorID: connector.connectorId,
          }, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }
}
