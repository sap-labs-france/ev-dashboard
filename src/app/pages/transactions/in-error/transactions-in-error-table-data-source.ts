import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import { AppDurationPipe } from 'shared/formatters/app-duration.pipe';
import { AppUnitPipe } from 'shared/formatters/app-unit.pipe';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { CarCatalog } from 'types/Car';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDeleteTransactionAction, TableDeleteTransactionActionDef } from '../../../shared/table/actions/transactions/table-delete-transaction-action';
import { TableDeleteTransactionsAction, TableDeleteTransactionsActionDef } from '../../../shared/table/actions/transactions/table-delete-transactions-action';
import { TableViewTransactionAction, TableViewTransactionActionDef, TransactionDialogData } from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { ConnectorTableFilter } from '../../../shared/table/filters/connector-table-filter';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ActionResponse, DataResult } from '../../../types/DataResult';
import { ErrorMessage, TransactionInError, TransactionInErrorType } from '../../../types/InError';
import { LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class TransactionsInErrorTableDataSource extends TableDataSource<TransactionInError> {
  private isAdmin = false;
  private isSiteAdmin = false;
  private viewAction = new TableViewTransactionAction().getActionDef();
  private deleteAction = new TableDeleteTransactionAction().getActionDef();
  private deleteManyAction = new TableDeleteTransactionsAction().getActionDef();
  private navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
  private errorTypes = [
    {
      key: TransactionInErrorType.INVALID_START_DATE,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.INVALID_START_DATE}.title`),
    },
    {
      key: TransactionInErrorType.NEGATIVE_ACTIVITY,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NEGATIVE_ACTIVITY}.title`),
    },
    {
      key: TransactionInErrorType.LONG_INACTIVITY,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.LONG_INACTIVITY}.title`),
    },
    {
      key: TransactionInErrorType.NO_CONSUMPTION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NO_CONSUMPTION}.title`),
    },
    {
      key: TransactionInErrorType.LOW_CONSUMPTION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.LOW_CONSUMPTION}.title`),
    },
    {
      key: TransactionInErrorType.OVER_CONSUMPTION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.OVER_CONSUMPTION}.title`),
    },
    {
      key: TransactionInErrorType.NEGATIVE_DURATION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NEGATIVE_DURATION}.title`),
    },
    {
      key: TransactionInErrorType.LOW_DURATION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.LOW_DURATION}.title`),
    },
    {
      key: TransactionInErrorType.MISSING_USER,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.MISSING_USER}.title`),
    }
  ];

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private appDurationPipe: AppDurationPipe,
    private appUnitPipe: AppUnitPipe,
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe) {
    super(spinnerService, translateService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // If pricing is activated check that transactions have been priced
    if (this.componentService.isActive(TenantComponents.PRICING)) {
      this.errorTypes.push({
        key: TransactionInErrorType.MISSING_PRICE,
        value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.MISSING_PRICE}.title`),
      });
    }
    // If billing is activated check that transactions have billing data
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      this.errorTypes.push({
        key: TransactionInErrorType.NO_BILLING_DATA,
        value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NO_BILLING_DATA}.title`),
      });
    }
    // Sort
    this.errorTypes.sort(Utils.sortArrayOfKeyValue);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService.getTransactionsInError(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
          this.formatErrorMessages(transactions.result);
          this.deleteManyAction.visible = this.authorizationService.isAdmin();
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          observer.error(error);
        });
    });
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      return [
        this.deleteManyAction,
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
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
      hasDynamicRowAction: true
    };
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      // Delete
      case TransactionButtonAction.DELETE_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableDeleteTransactionsActionDef).action(
            this.getSelectedRows(), this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router,
            this.clearSelectedRows.bind(this), this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [];
    if (this.isAdmin) {
      columns.push({
        id: 'id',
        name: 'transactions.id',
        headerClass: 'col-10p',
        class: 'col-10p',
      });
    }
    columns.push(
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
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p p-0',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        headerClass: 'col-30p',
        class: 'col-30p text-danger',
        sortable: true,
        formatter: (value: string, row: TransactionInError) => this.translateService.instant(`transactions.errors.${row.errorCode}.title`),
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (totalDurationSecs: number) => this.appDurationPipe.transform(totalDurationSecs),
      },
      {
        id: 'stop.totalConsumptionWh',
        name: 'transactions.consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (totalConsumptionWh: number) => this.appUnitPipe.transform(totalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'stateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (stateOfCharge: number, row: Transaction) => stateOfCharge ? `${stateOfCharge}% > ${row.stop.stateOfCharge}%` : '-',
      },
    );
    if (this.isAdmin || this.isSiteAdmin) {
      columns.push(
        {
          id: 'user',
          name: 'transactions.user',
          headerClass: 'col-15p',
          class: 'text-left col-15p',
          formatter: (value: User) => this.appUserNamePipe.transform(value),
        },
        {
          id: 'tagID',
          name: 'transactions.badge_id',
          headerClass: 'col-15p',
          class: 'text-left col-15p',
          formatter: (tagID: string) => tagID ? tagID : '-'
        }
      );
      if (this.componentService.isActive(TenantComponents.CAR)) {
        if (this.authorizationService.canListCars()) {
          columns.push({
            id: 'carCatalog',
            name: 'car.title',
            headerClass: 'text-center col-15p',
            class: 'text-center col-15p',
            sortable: true,
            formatter: (carCatalog: CarCatalog) => carCatalog ? Utils.buildCarCatalogName(carCatalog) : '-',
          });
        }
      }
    }
    return columns as TableColumnDef[];
  }

  public formatChargingStation(chargingStationID: string, row: Transaction) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    // Build filters
    const filters: TableFilterDef[] = [
      new DateRangeTableFilter({
        translateService: this.translateService
      }).getFilterDef(),
      new ErrorTypeTableFilter(this.errorTypes).getFilterDef(),
    ];
    const issuerFilter = new IssuerFilter().getFilterDef();
    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
      const siteAreaFilter = new SiteAreaTableFilter([issuerFilter, siteFilter]).getFilterDef();
      filters.push(siteFilter);
      filters.push(siteAreaFilter);
      if (this.authorizationService.canListChargingStations()) {
        filters.push(new ChargingStationTableFilter([issuerFilter, siteFilter, siteAreaFilter]).getFilterDef());
        filters.push(new ConnectorTableFilter().getFilterDef());
      }
      if (this.authorizationService.canListUsers()) {
        filters.push(new UserTableFilter([issuerFilter, siteFilter]).getFilterDef());
      }
    } else {
      if (this.authorizationService.canListChargingStations()) {
        filters.push(new ChargingStationTableFilter([issuerFilter]).getFilterDef());
        filters.push(new ConnectorTableFilter().getFilterDef());
      }
      if (this.authorizationService.canListUsers()) {
        filters.push(new UserTableFilter([issuerFilter]).getFilterDef());
      }
    }
    return filters;
  }

  public buildTableDynamicRowActions(transaction: TransactionInError): TableActionDef[] {
    const rowActions: TableActionDef[] = [
      this.viewAction
    ];
    const moreActions = new TableMoreAction([]);
    if (transaction.issuer) {
      if (transaction.errorCode === TransactionInErrorType.NO_BILLING_DATA) {
        // TODO - no use-case so far for an explicit 'Create Invoice' action
        // - Authorization are not in place
        // moreActions.addActionInMoreActions(this.createInvoice);
      }
      if (this.authorizationService.canListLogs()) {
        moreActions.addActionInMoreActions(this.navigateToLogsAction);
      }
      if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
        rowActions.push(moreActions.getActionDef());
      }
      if (this.authorizationService.canDeleteTransaction()) {
        moreActions.addActionInMoreActions(this.deleteAction);
      }
    } else {
      if (this.authorizationService.canListLogs()) {
        moreActions.addActionInMoreActions(this.navigateToLogsAction);
      }
    }
    return rowActions;
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.DELETE_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableDeleteTransactionActionDef).action(
            transaction, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(TransactionDialogComponent, this.dialog,
            { dialogData: { transactionID: transaction.id } as TransactionDialogData },
            this.refreshData.bind(this));
        }
        break;
      case LogButtonAction.NAVIGATE_TO_LOGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('logs?ChargingStationID=' + transaction.chargeBoxID +
            '&StartDateTime=' + transaction.timestamp + '&LogLevel=I');
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

  protected deleteTransaction(transaction: Transaction) {
    this.centralServerService.deleteTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        this.translateService.instant('transactions.notification.delete.success',
          { user: this.appUserNamePipe.transform(transaction.user) }));
      this.refreshData().subscribe();
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.delete.error');
    });
  }

  private formatErrorMessages(transactions: TransactionInError[]) {
    transactions.forEach((transaction) => {
      const path = `transactions.errors.${transaction.errorCode}`;
      const errorMessage: ErrorMessage = {
        title: `${path}.title`,
        titleParameters: {},
        description: `${path}.description`,
        descriptionParameters: {},
        action: `${path}.action`,
        actionParameters: {},
      };
      switch (transaction.errorCode) {
        case 'noConsumption':
          // nothing to do
          break;
      }
      transaction.errorMessage = errorMessage;
    });
  }
}
