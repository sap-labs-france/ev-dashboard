import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { Observable } from 'rxjs';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import {
  TableDeleteTransactionsAction,
  TableDeleteTransactionsActionDef,
} from 'shared/table/actions/transactions/table-delete-transactions-action';
import { ConnectorTableFilter } from 'shared/table/filters/connector-table-filter';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { TransactionsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableNavigateToChargingPlansAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-charging-plans-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableExportTransactionOcpiCdrAction,
  TableExportTransactionOcpiCdrActionDef,
} from '../../../shared/table/actions/transactions/table-export-transaction-ocpi-cdr';
import {
  TableExportTransactionsAction,
  TableExportTransactionsActionDef,
} from '../../../shared/table/actions/transactions/table-export-transactions-action';
import {
  TablePushTransactionOcpiCdrAction,
  TablePushTransactionOcpiCdrActionDef,
} from '../../../shared/table/actions/transactions/table-push-transaction-ocpi-cdr-action';
import {
  TableViewTransactionAction,
  TableViewTransactionActionDef,
  TransactionDialogData,
} from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { IssuerFilter, organizations } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TagTableFilter } from '../../../shared/table/filters/tag-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ChargingStationButtonAction, Connector } from '../../../types/ChargingStation';
import { TransactionDataResult } from '../../../types/DataResult';
import { LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { User } from '../../../types/User';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';
import { TransactionsInactivityStatusFilter } from '../filters/transactions-inactivity-status-filter';

@Injectable()
export class TransactionsHistoryTableDataSource extends TableDataSource<Transaction> {
  private readonly isOrganizationComponentActive: boolean;

  private viewAction = new TableViewTransactionAction().getActionDef();
  private canExport = new TableExportTransactionsAction().getActionDef();
  private deleteManyAction = new TableDeleteTransactionsAction().getActionDef();

  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  private chargingStationFilter: TableFilterDef;
  private connectorFilter: TableFilterDef;
  private userFilter: TableFilterDef;
  private tagsFilter: TableFilterDef;
  private dateRangeFilter: TableFilterDef;
  private inactivityFilter: TableFilterDef;

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
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([
        {
          WithCompany: true,
          WithSite: true,
          WithSiteArea: true,
          WithTag: true,
          WithUser: true,
          WithCar: true,
          Statistics: 'history',
        },
      ]);
    }
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    // User
    const userID = this.windowService.getUrlParameterValue('UserID');
    if (userID) {
      const userTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue.push({
          key: userID,
          value: '-',
        });
        this.filterChanged(userTableFilter);
      }
      this.loadUserFilterLabel(userID);
    }
    // Tag
    const visualID = this.windowService.getUrlParameterValue('VisualID');
    if (visualID) {
      const tagTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'tag');
      if (tagTableFilter) {
        tagTableFilter.currentValue.push({
          key: visualID,
          value: visualID,
        });
        this.filterChanged(tagTableFilter);
      }
    }
    // Issuer
    const issuer = this.windowService.getUrlParameterValue('Issuer');
    if (issuer) {
      const issuerTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'issuer');
      if (issuerTableFilter) {
        issuerTableFilter.currentValue = [
          organizations.find((organisation) => organisation.key === issuer),
        ];
        this.filterChanged(issuerTableFilter);
      }
    }
    // Charging Station
    const chargingStationID = this.windowService.getUrlParameterValue('ChargingStationID');
    if (chargingStationID) {
      const chargingStationTableFilter = this.tableFiltersDef.find(
        (filter) => filter.id === 'charger'
      );
      if (chargingStationTableFilter) {
        chargingStationTableFilter.currentValue = [
          { key: chargingStationID, value: chargingStationID },
        ];
        this.filterChanged(chargingStationTableFilter);
      }
    }
  }

  public loadUserFilterLabel(userID: string) {
    this.centralServerService.getUser(userID).subscribe({
      next: (user: User) => {
        const userTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'user');
        if (userTableFilter) {
          userTableFilter.currentValue = [
            {
              key: userID,
              value: Utils.buildUserFullName(user),
            },
          ];
          this.filterChanged(userTableFilter);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('users.user_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      },
    });
  }

  public loadDataImpl(): Observable<TransactionDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
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
            this.canExport.visible = this.transactionsAuthorizations.canExport;
            this.deleteManyAction.visible = this.transactionsAuthorizations.canDelete;
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
        enabled: true,
        multiple: true,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
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
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'stop.timestamp',
        name: 'transactions.end_date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'stop.reason',
        name: 'transactions.stop_reason',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (reason: string) => reason ?? '-',
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-15p',
        sortable: true,
        class: 'text-left col-15p',
      },
      {
        id: 'connectorId',
        name: 'chargers.connector',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (connectorId: number) => this.appConnectorIdPipe.transform(connectorId),
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (totalDurationSecs: number) => this.appDurationPipe.transform(totalDurationSecs),
      },
      {
        id: 'stop.totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: TransactionsInactivityCellComponent,
      },
      {
        id: 'stop.totalConsumptionWh',
        name: 'transactions.consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (totalConsumptionWh: number) =>
          this.appUnitPipe.transform(totalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'stateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (stateOfCharge: number, row: Transaction) =>
          stateOfCharge ? `${stateOfCharge}% > ${row.stop.stateOfCharge}%` : '-',
      },
      {
        id: 'stop.roundedPrice',
        name: 'transactions.price',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (roundedPrice: number, transaction: Transaction) =>
          this.appCurrencyPipe.transform(roundedPrice, transaction.stop.priceUnit),
        visible: this.componentService.isActive(TenantComponents.PRICING),
      },
      {
        id: 'company.name',
        name: 'companies.title',
        class: 'col-20p',
        headerClass: 'col-20p',
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'site.name',
        name: 'sites.title',
        class: 'col-20p',
        headerClass: 'col-20p',
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        class: 'col-20p',
        headerClass: 'col-20p',
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'user.name',
        name: 'transactions.user',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        formatter: (value: string, row: Transaction) => this.appUserNamePipe.transform(row.user),
      },
      {
        id: 'tagID',
        name: 'tags.id',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (tagID: string) => (tagID ? tagID : '-'),
      },
      {
        id: 'tag.visualID',
        name: 'tags.visual_id',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        formatter: (visualID: string) => (visualID ? visualID : '-'),
      },
      {
        id: 'tag.description',
        name: 'general.description',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
      },
      {
        id: 'carCatalog.vehicleMake',
        name: 'car.title',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
        formatter: (value: string, row: Transaction) =>
          row.carCatalog ? Utils.buildCarCatalogName(row.carCatalog) : '-',
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
      {
        id: 'billingData.stop.invoiceNumber',
        name: 'invoices.number',
        headerClass: 'text-center col-10p',
        class: 'col-10p',
        formatter: (invoiceNumber: string) => invoiceNumber || '-',
        visible: this.componentService.isActive(TenantComponents.BILLING),
      },
    ];
  }

  public formatInactivity(totalInactivitySecs: number, row: Transaction) {
    let percentage = 0;
    if (row.stop) {
      percentage =
        row.stop.totalDurationSecs > 0 ? totalInactivitySecs / row.stop.totalDurationSecs : 0;
    }
    return (
      this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.appPercentPipe.transform(percentage, '1.0-0')})`
    );
  }

  public formatChargingStation(chargingStationID: string, connector: Connector) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(connector.connectorId)}`;
  }

  public buildTableFooterStats(data: TransactionDataResult): string {
    // All records has been retrieved
    if (data.count !== Constants.INFINITE_RECORDS) {
      // Stats?
      if (data.stats) {
        const percentInactivity =
          data.stats.totalDurationSecs > 0
            ? Math.floor((data.stats.totalInactivitySecs / data.stats.totalDurationSecs) * 100)
            : 0;
        // Total Duration
        // eslint-disable-next-line max-len
        let stats = `${this.translateService.instant(
          'transactions.duration'
        )}: ${this.appDurationPipe.transform(data.stats.totalDurationSecs)} | `;
        // Inactivity
        // eslint-disable-next-line max-len
        stats += `${this.translateService.instant(
          'transactions.inactivity'
        )}: ${this.appDurationPipe.transform(
          data.stats.totalInactivitySecs
        )} (${percentInactivity}%) | `;
        // Total Consumption
        // eslint-disable-next-line max-len
        stats += `${this.translateService.instant(
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
        // Total Price
        // eslint-disable-next-line max-len
        stats += ` | ${this.translateService.instant(
          'transactions.price'
        )}: ${this.appCurrencyPipe.transform(data.stats.totalPrice, data.stats.currency)}`;
        return stats;
      }
    }
    return '';
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.dateRangeFilter = new DateRangeTableFilter({
      translateService: this.translateService,
    }).getFilterDef();
    this.inactivityFilter = new TransactionsInactivityStatusFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([
      this.issuerFilter,
      this.siteFilter,
    ]).getFilterDef();
    this.chargingStationFilter = new ChargingStationTableFilter([
      this.issuerFilter,
      this.siteFilter,
      this.siteAreaFilter,
    ]).getFilterDef();
    this.connectorFilter = new ConnectorTableFilter().getFilterDef();
    this.userFilter = new UserTableFilter([this.siteFilter]).getFilterDef();
    this.tagsFilter = new TagTableFilter([this.userFilter]).getFilterDef();
    // Create filters
    const filters: TableFilterDef[] = [
      this.issuerFilter,
      this.dateRangeFilter,
      this.inactivityFilter,
      this.siteFilter,
      this.siteAreaFilter,
      this.chargingStationFilter,
      this.connectorFilter,
      this.userFilter,
      this.tagsFilter,
    ];
    return filters;
  }

  public buildTableDynamicRowActions(transaction: Transaction): TableActionDef[] {
    const rowActions: TableActionDef[] = [this.viewAction];
    // More action
    const moreActions = new TableMoreAction([]);
    if (transaction.canListLogs) {
      const navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
      moreActions.addActionInMoreActions(navigateToLogsAction);
    }
    if (transaction.canReadChargingStation) {
      const navigateToChargingPlansAction = new TableNavigateToChargingPlansAction().getActionDef();
      moreActions.addActionInMoreActions(navigateToChargingPlansAction);
    }
    if (transaction.canPushTransactionCDR) {
      const transactionPushOcpiCdrAction = new TablePushTransactionOcpiCdrAction().getActionDef();
      moreActions.addActionInMoreActions(transactionPushOcpiCdrAction);
    }
    if (transaction.canExportOcpiCdr) {
      const exportTransactionOcpiCdrAction =
        new TableExportTransactionOcpiCdrAction().getActionDef();
      moreActions.addActionInMoreActions(exportTransactionOcpiCdrAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public canDisplayRowAction(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.REFUND_TRANSACTIONS:
        return !Utils.objectHasProperty(transaction, 'refund');
      default:
        return true;
    }
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
      case LogButtonAction.NAVIGATE_TO_LOGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            'logs?ChargingStationID=' +
              transaction.chargeBoxID +
              '&StartDateTime=' +
              transaction.timestamp +
              '&EndDateTime=' +
              transaction.stop.timestamp +
              '&LogLevel=I',
            this.windowService
          );
        }
        break;
      case ChargingStationButtonAction.NAVIGATE_TO_CHARGING_PLANS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            'charging-stations#chargingplans?ChargingStationID=' +
              transaction.chargeBoxID +
              '&TransactionID=' +
              transaction.id,
            this.windowService
          );
        }
        break;
      case TransactionButtonAction.PUSH_TRANSACTION_CDR:
        if (actionDef.action) {
          (actionDef as TablePushTransactionOcpiCdrActionDef).action(
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
        break;
      case TransactionButtonAction.EXPORT_TRANSACTION_OCPI_CDR:
        if (actionDef.action) {
          (actionDef as TableExportTransactionOcpiCdrActionDef).action(
            transaction.id,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.canExport, this.deleteManyAction, ...tableActionsDef];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
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
      case TransactionButtonAction.DELETE_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableDeleteTransactionsActionDef).action(
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
    }
  }
}
