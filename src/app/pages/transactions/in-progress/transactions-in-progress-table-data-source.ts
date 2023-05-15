import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import { ConnectorTableFilter } from 'shared/table/filters/connector-table-filter';
import { TransactionsAuthorizations } from 'types/Authorization';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppBatteryPercentagePipe } from '../../../shared/formatters/app-battery-percentage.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import {
  TableChargingStationsStopTransactionAction,
  TableChargingStationsStopTransactionActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-stop-transaction-action';
import { TableNavigateToChargingPlansAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-charging-plans-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableViewTransactionAction,
  TableViewTransactionActionDef,
  TransactionDialogData,
} from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TagTableFilter } from '../../../shared/table/filters/tag-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ChargingStationButtonAction, Connector } from '../../../types/ChargingStation';
import { DataResult, TransactionDataResult } from '../../../types/DataResult';
import { LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import {
  Transaction,
  TransactionButtonAction,
  TransactionStatisticsType,
} from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { TransactionsConnectorCellComponent } from '../cell-components/transactions-connector-cell.component';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';

@Injectable()
export class TransactionsInProgressTableDataSource extends TableDataSource<Transaction> {
  private viewAction = new TableViewTransactionAction().getActionDef();
  private stopAction = new TableChargingStationsStopTransactionAction().getActionDef();
  private readonly isOrganizationComponentActive: boolean;
  private transactionsAuthorizations: TransactionsAuthorizations;

  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  private chargingStationFilter: TableFilterDef;
  private connectorFilter: TableFilterDef;
  private userFilter: TableFilterDef;
  private tagsFilter: TableFilterDef;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private appCurrencyPipe: AppCurrencyPipe,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appBatteryPercentagePipe: AppBatteryPercentagePipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
    // Init
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([
        {
          WithCompany: true,
          WithSite: true,
          WithSiteArea: true,
          WithTag: true,
          WithUser: true,
          WithCar: true,
          WithChargingStation: true,
          Statistics: TransactionStatisticsType.ONGOING,
        },
      ]);
    }
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService
        .getActiveTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
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
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component col-10p',
        isAngularComponent: true,
        angularComponent: TransactionsConnectorCellComponent,
      },
      {
        id: 'info',
        name: 'chargers.connector_info_title',
        headerClass: 'col-10em',
        class: 'col-10em',
        formatter: (info: string, row: Connector) => Utils.buildConnectorInfo(row),
        sortable: false,
      },
      {
        id: 'currentTotalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (currentTotalDurationSecs: number, row: Transaction) =>
          this.appDurationPipe.transform(
            (new Date().getTime() - new Date(row.timestamp).getTime()) / 1000
          ),
      },
      {
        id: 'currentTotalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: TransactionsInactivityCellComponent,
      },
      {
        id: 'currentInstantWatts',
        name: 'transactions.current_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentInstantWatts: number) =>
          this.appUnitPipe.transform(currentInstantWatts, 'W', 'kW'),
      },
      {
        id: 'currentTotalConsumptionWh',
        name: 'transactions.total_consumption',
        formatter: (currentTotalConsumptionWh: number) =>
          this.appUnitPipe.transform(currentTotalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentStateOfCharge: number, row: Transaction) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return this.appBatteryPercentagePipe.transform(row.stateOfCharge, currentStateOfCharge);
        },
      },
      {
        id: 'currentCumulatedPrice',
        name: 'transactions.price',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (price: number, transaction: Transaction) =>
          this.appCurrencyPipe.transform(price, transaction.priceUnit),
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
      },
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.STOP_TRANSACTION:
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
        break;
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
    }
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
    // Remote stop
    if (transaction.canRemoteStopTransaction) {
      rowActions.push(this.stopAction);
    }
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
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }
}
