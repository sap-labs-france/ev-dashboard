import { Injectable } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { SpinnerService } from 'app/services/spinner.service';
import { EndDateFilter } from 'app/shared/table/filters/end-date-filter';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter.js';
import { StartDateFilter } from 'app/shared/table/filters/start-date-filter';
import { Action, Entity } from 'app/types/Authorization';
import { ActionResponse, DataResult } from 'app/types/DataResult';
import { ErrorMessage, TransactionInError, TransactionInErrorType } from 'app/types/InError';
import { Data, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { User } from 'app/types/User';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TableDeleteTransactionAction } from '../table-actions/table-delete-transaction-action';
import { TableDeleteTransactionsAction } from '../table-actions/table-delete-transactions-action';
import { TableViewTransactionAction } from '../table-actions/table-view-transaction-action';


@Injectable()
export class TransactionsInErrorTableDataSource extends TableDataSource<Transaction> {
  private isAdmin = false;
  private isSiteAdmin = false;
  private dialogRefSession: any;
  private viewAction = new TableViewTransactionAction().getActionDef();
  private deleteAction = new TableDeleteTransactionAction().getActionDef();
  private deleteManyAction = new TableDeleteTransactionsAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe) {
    super(spinnerService, translateService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService.getTransactionsInError(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
          this.formatErrorMessages(transactions.result);
          if (transactions.count === 0) {
            this.deleteManyAction.disabled = true;
          }
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public toggleRowSelection(row: Data, event: MatCheckboxChange) {
    super.toggleRowSelection(row, event);
    this.deleteManyAction.disabled = this.selectedRows === 0;
  }

  public selectAllRows() {
    super.selectAllRows();
    this.deleteManyAction.disabled = this.selectedRows === 0;
  }

  public clearSelectedRows() {
    super.clearSelectedRows();
    this.deleteManyAction.disabled = true;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      this.deleteManyAction.disabled = true;
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
    };
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      // Delete
      case TransactionButtonAction.DELETE_TRANSACTIONS:
        if (actionDef.action) {
          actionDef.action(
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
        headerClass: 'd-none d-xl-table-cell',
        class: 'd-none d-xl-table-cell',
      });
    }
    if (this.isAdmin || this.isSiteAdmin) {
      columns.push({
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value: User) => this.appUserNamePipe.transform(value),
      });
    }
    columns.push(
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        class: 'text-left',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left',
        formatter: (chargingStationID: string, row: TransactionInError) => this.formatChargingStation(chargingStationID, row),
      },
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        headerClass: 'text-center',
        class: 'action-cell text-center',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        class: 'col-30p text-danger',
        sortable: true,
        formatter: (value: string, row: TransactionInError) => this.translateService.instant(`transactions.errors.${row.errorCode}.title`),
      },
    );
    return columns as TableColumnDef[];
  }

  public formatChargingStation(chargingStationID: string, row: Transaction) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: TransactionInErrorType.INVALID_START_DATE,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.INVALID_START_DATE}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.NEGATIVE_ACTIVITY,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NEGATIVE_ACTIVITY}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.LONG_INACTIVITY,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.LONG_INACTIVITY}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.NO_CONSUMPTION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NO_CONSUMPTION}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.OVER_CONSUMPTION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.OVER_CONSUMPTION}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.NEGATIVE_DURATION,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.NEGATIVE_DURATION}.title`),
    });
    errorTypes.push({
      key: TransactionInErrorType.MISSING_USER,
      value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.MISSING_USER}.title`),
    });
    // If pricing is activated check that transactions have been priced
    if (this.componentService.isActive(TenantComponents.PRICING)) {
      errorTypes.push({
        key: TransactionInErrorType.MISSING_PRICE,
        value: this.translateService.instant(`transactions.errors.${TransactionInErrorType.MISSING_PRICE}.title`),
      });
    }
    // Sort
    errorTypes.sort(Utils.sortArrayOfKeyValue);
    // Build filters
    const filters: TableFilterDef[] = [
      new StartDateFilter(moment().startOf('y').toDate()).getFilterDef(),
      new EndDateFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];
    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      filters.push(new ChargerTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
      filters.push(new SiteTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
      filters.push(new SiteAreaTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    } else {
      filters.push(new ChargerTableFilter().getFilterDef());
    }
    if (this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights()) {
      filters.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }
    return filters;
  }

  public buildTableRowActions(): TableActionDef[] {
    const actions = [];
    if (this.authorizationService.canAccess(Entity.TRANSACTION, Action.READ)) {
      actions.push(this.viewAction);
    }
    if (this.authorizationService.canAccess(Entity.TRANSACTION, Action.DELETE)) {
      actions.push(this.deleteAction);
    }
    return actions;
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.DELETE_TRANSACTION:
        if (actionDef.action) {
          actionDef.action(transaction, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          actionDef.action(transaction, this.dialog, this.refreshData.bind(this));
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
        // tslint:disable-next-line:max-line-length
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
