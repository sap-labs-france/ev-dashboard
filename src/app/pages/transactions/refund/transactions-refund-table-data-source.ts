import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import {
  TableViewTransactionAction,
  TableViewTransactionActionDef,
  TransactionDialogData,
} from 'shared/table/actions/transactions/table-view-transaction-action';
import { ConnectorTableFilter } from 'shared/table/filters/connector-table-filter';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import { TagTableFilter } from 'shared/table/filters/tag-table-filter';
import { TransactionsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableExportTransactionsAction,
  TableExportTransactionsActionDef,
} from '../../../shared/table/actions/transactions/table-export-transactions-action';
import { TableOpenURLRefundAction } from '../../../shared/table/actions/transactions/table-open-url-concur-action';
import {
  TableRefundTransactionsAction,
  TableRefundTransactionsActionDef,
} from '../../../shared/table/actions/transactions/table-refund-transactions-action';
import {
  TableSyncRefundTransactionsAction,
  TableSyncRefundTransactionsActionDef,
} from '../../../shared/table/actions/transactions/table-sync-refund-transactions-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { ReportTableFilter } from '../../../shared/table/filters/report-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { TransactionDataResult, TransactionRefundDataResult } from '../../../types/DataResult';
import { RefundSettings } from '../../../types/Setting';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransactionsRefundStatusFilter } from '../filters/transactions-refund-status-filter';

@Injectable()
export class TransactionsRefundTableDataSource extends TableDataSource<Transaction> {
  private refundSetting!: RefundSettings;
  private syncRefundAction = new TableSyncRefundTransactionsAction().getActionDef();
  private exportTransactionsAction = new TableExportTransactionsAction().getActionDef();
  private refundTransactionsAction = new TableRefundTransactionsAction().getActionDef();
  private openURLRefundAction = new TableOpenURLRefundAction().getActionDef();
  private viewAction = new TableViewTransactionAction().getActionDef();

  private dateRangeFilter: TableFilterDef;
  private statusFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  private chargingStationFilter: TableFilterDef;
  private connectorFilter: TableFilterDef;
  private userFilter: TableFilterDef;
  private tagsFilter: TableFilterDef;
  private reportFilter: TableFilterDef;

  private transactionsAuthorizations: TransactionsAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appPercentPipe: AppPercentPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([
      {
        WithUser: true,
        WithCar: true,
        Statistics: 'refund',
      },
    ]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<TransactionDataResult> {
    return new Observable((observer) => {
      const filters = this.buildFilterValues();
      filters['MinimalPrice'] = '0';
      this.centralServerService
        .getTransactionsToRefund(filters, this.getPaging(), this.getSorting())
        .subscribe({
          next: (transactions) => {
            // Initialize transactions authorization
            this.transactionsAuthorizations = {
              // Authorization actions
              canListChargingStations: Utils.convertToBoolean(transactions.canListChargingStations),
              canListSiteAreas: Utils.convertToBoolean(transactions.canListSiteAreas),
              canListSites: Utils.convertToBoolean(transactions.canListSites),
              canListTags: Utils.convertToBoolean(transactions.canListTags),
              canListUsers: Utils.convertToBoolean(transactions.canListUsers),
              canExport: Utils.convertToBoolean(transactions.canExport),
              canDelete: Utils.convertToBoolean(transactions.canDelete),
              canRefund: Utils.convertToBoolean(transactions.canRefund),
              canSyncRefund: Utils.convertToBoolean(transactions.canSyncRefund),
              canReadSetting: Utils.convertToBoolean(transactions.canReadSetting),
              // metadata
              metadata: transactions.metadata,
            };
            // Update filters visibility
            this.siteFilter.visible = this.transactionsAuthorizations.canListSites;
            this.siteAreaFilter.visible = this.transactionsAuthorizations.canListSiteAreas;
            this.chargingStationFilter.visible =
              this.transactionsAuthorizations.canListChargingStations;
            this.connectorFilter.visible = this.transactionsAuthorizations.canListChargingStations;
            this.userFilter.visible = this.transactionsAuthorizations.canListUsers;
            this.tagsFilter.visible = this.transactionsAuthorizations.canListTags;
            // Update action visibility
            this.syncRefundAction.visible = this.transactionsAuthorizations.canSyncRefund;
            this.exportTransactionsAction.visible = this.transactionsAuthorizations.canExport;
            this.refundTransactionsAction.visible = this.transactionsAuthorizations.canRefund;
            this.openURLRefundAction.visible = this.transactionsAuthorizations.canRefund;
            // Build table def using authorization init
            this.setTableDef(this.buildTableDef());
            // Load refund settings
            this.loadRefundSettings();
            observer.next(transactions);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowSelection: {
        enabled: this.transactionsAuthorizations?.canRefund,
        multiple: this.transactionsAuthorizations?.canRefund,
      },
      rowDetails: {
        enabled: false,
        angularComponent: ConsumptionChartDetailComponent,
      },
    };
  }

  public buildTableFooterStats(data: TransactionRefundDataResult): string {
    // All records has been retrieved
    if (data.count !== Constants.INFINITE_RECORDS) {
      // Stats?
      if (data.stats) {
        // Total Consumption
        // eslint-disable-next-line max-len
        let stats = `| ${this.translateService.instant(
          'transactions.consumption'
        )}: ${this.appUnitPipe.transform(
          data.stats.totalConsumptionWattHours,
          'Wh',
          'kWh',
          true,
          1,
          0,
          0
        )}`;
        // Refund transactions
        // eslint-disable-next-line max-len
        stats += ` | ${this.translateService.instant('transactions.refund_transactions')}: ${
          data.stats.countRefundTransactions
        } (${this.appCurrencyPipe.transform(data.stats.totalPriceRefund, data.stats.currency)})`;
        // Pending transactions
        // eslint-disable-next-line max-len
        stats += ` | ${this.translateService.instant('transactions.pending_transactions')}: ${
          data.stats.countPendingTransactions
        } (${this.appCurrencyPipe.transform(data.stats.totalPricePending, data.stats.currency)})`;
        // Number of reimbursed reports submitted
        // eslint-disable-next-line max-len
        stats += ` | ${this.translateService.instant('transactions.count_refunded_reports')}: ${
          data.stats.countRefundedReports
        }`;
        return stats;
      }
    }
    return '';
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'transactions.id',
        headerClass: 'col-10p',
        class: 'col-10p',
      },
      {
        id: 'refundData.reportId',
        name: 'transactions.reportId',
        sortable: true,
      },
      {
        id: 'refundData.refundedAt',
        name: 'transactions.refundDate',
        sortable: true,
        formatter: (refundedAt) => this.datePipe.transform(refundedAt),
      },
      {
        id: 'refundData.status',
        name: 'transactions.state',
        formatter: (value) => this.translateService.instant(`transactions.refund_${value}`),
      },
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        class: 'text-left',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.datePipe.transform(value),
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left col-15p',
        headerClass: 'col-15p',
        sortable: true,
      },
      {
        id: 'connectorId',
        name: 'chargers.connector',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (connectorId: number) => this.appConnectorIdPipe.transform(connectorId),
      },
      {
        id: 'user.name',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value: string, row: Transaction) => this.appUserNamePipe.transform(row.user),
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (totalDurationSecs) => this.appDurationPipe.transform(totalDurationSecs),
      },
      {
        id: 'stop.totalConsumptionWh',
        name: 'transactions.total_consumption',
        formatter: (totalConsumptionWh) =>
          this.appUnitPipe.transform(totalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'stop.price',
        name: 'transactions.price',
        formatter: (price, row) => this.appCurrencyPipe.transform(price, row.stop.priceUnit),
      },
      {
        id: 'carCatalog.vehicleMake',
        name: 'car.title',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
        formatter: (value: string, row: Transaction) =>
          row.carCatalog ? Utils.buildCarCatalogName(row.carCatalog) : '-',
        visible: this.componentService.isActive(TenantComponents.CAR),
      },
      {
        id: 'car.licensePlate',
        name: 'cars.license_plate',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
        formatter: (licensePlate: string) => (licensePlate ? licensePlate : '-'),
        visible: this.componentService.isActive(TenantComponents.CAR),
      },
    ];
  }

  public formatInactivity(totalInactivitySecs: number, row: Transaction) {
    const percentage =
      row.stop.totalDurationSecs > 0 ? totalInactivitySecs / row.stop.totalDurationSecs : 0;
    if (percentage === 0) {
      return '';
    }
    return (
      this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.appPercentPipe.transform(percentage, '2.0-0')})`
    );
  }

  public formatChargingStation(chargingStationID: string, row: Transaction) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.dateRangeFilter = new DateRangeTableFilter({
      translateService: this.translateService,
    }).getFilterDef();
    this.statusFilter = new TransactionsRefundStatusFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter().getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([this.siteFilter]).getFilterDef();
    this.chargingStationFilter = new ChargingStationTableFilter([
      this.siteFilter,
      this.siteAreaFilter,
    ]).getFilterDef();
    this.connectorFilter = new ConnectorTableFilter().getFilterDef();
    this.userFilter = new UserTableFilter([this.siteFilter]).getFilterDef();
    this.tagsFilter = new TagTableFilter([this.userFilter]).getFilterDef();
    this.reportFilter = new ReportTableFilter().getFilterDef();
    // Create filters
    const filters: TableFilterDef[] = [
      this.dateRangeFilter,
      this.statusFilter,
      this.siteFilter,
      this.siteAreaFilter,
      this.chargingStationFilter,
      this.connectorFilter,
      this.userFilter,
      this.tagsFilter,
      this.reportFilter,
    ];
    return filters;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.syncRefundAction,
      this.refundTransactionsAction,
      this.openURLRefundAction,
      this.exportTransactionsAction,
      ...tableActionsDef,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case TransactionButtonAction.REFUND_SYNCHRONIZE:
        if (actionDef.action) {
          (actionDef as TableSyncRefundTransactionsActionDef).action(
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
      case TransactionButtonAction.REFUND_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableRefundTransactionsActionDef).action(
            this.refundSetting,
            this.getSelectedRows(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.clearSelectedRows.bind(this),
            this.refreshData.bind(this)
          );
        }
        break;
      case TransactionButtonAction.OPEN_REFUND_URL:
        if (!this.refundSetting) {
          this.messageService.showErrorMessage(
            this.translateService.instant(
              'transactions.notification.refund.concur_connection_invalid'
            )
          );
        } else if (this.refundSetting && this.refundSetting.concur && actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            this.refundSetting.concur.appUrl
              ? this.refundSetting.concur.appUrl
              : this.refundSetting.concur.apiUrl,
            this.windowService
          );
        }
        break;
      case TransactionButtonAction.EXPORT_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableExportTransactionsActionDef).action(
            this.buildFilterValues(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.viewAction];
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(
            TransactionDialogComponent,
            this.dialog,
            { dialogData: { transactionID: transaction.id } as TransactionDialogData },
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public isSelectable(row: Transaction) {
    return row.canRefundTransaction;
  }

  private loadRefundSettings() {
    if (this.transactionsAuthorizations.canReadSetting) {
      this.componentService.getRefundSettings().subscribe({
        next: (refundSettings) => {
          if (refundSettings) {
            this.refundSetting = refundSettings;
          }
        },
        error: (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'general.error_backend'
          );
        },
      });
    }
  }
}
