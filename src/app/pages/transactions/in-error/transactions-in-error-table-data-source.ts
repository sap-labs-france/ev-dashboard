import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter.js';
import { Action, Entity } from 'app/types/Authorization';
import { ActionsResponse, ActionResponse, DataResult } from 'app/types/DataResult';
import { ButtonAction, SubjectInfo } from 'app/types/GlobalType';
import { ErrorMessage, TransactionInError, TransactionInErrorType } from 'app/types/InError';
import { RefundStatus } from 'app/types/Refund';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Transaction } from 'app/types/Transaction';
import { User } from 'app/types/User';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { TransactionDialogComponent } from '../../../shared/dialogs/transactions/transaction-dialog.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TransactionsDateFromFilter } from '../filters/transactions-date-from-filter';
import { TransactionsDateUntilFilter } from '../filters/transactions-date-until-filter';

@Injectable()
export class TransactionsInErrorTableDataSource extends TableDataSource<Transaction> {
  private isAdmin = false;
  private isSiteAdmin = false;
  private dialogRefSession: any;
  private openAction = new TableOpenAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
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
    super(spinnerService);
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
          // Ok
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      return [
        new TableDeleteAction().getActionDef(),
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
    // Action
    switch (actionDef.id) {
      // Remove
      case ButtonAction.DELETE:
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('transactions.delete_transactions_title'),
            this.translateService.instant('transactions.delete_transactions_confirm', { quantity: this.getSelectedRows().length }),
          ).subscribe((response) => {
            // Check
            if (response === ButtonType.YES) {
              this.deleteTransactions(this.getSelectedRows().map((row) => row.id));
            }
          });
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
        class: 'col-30p',
        sortable: true,
        formatter: (value: string, row: TransactionInError) => this.translateService.instant(`transactions.errors.${row.errorCode}.title`),
      },
    );
    return columns as TableColumnDef[];
  }

  formatChargingStation(chargingStationID: string, row: Transaction) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  buildTableFiltersDef(): TableFilterDef[] {
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: TransactionInErrorType.INVALID_START_DATE,
      value: `transactions.errors.${TransactionInErrorType.INVALID_START_DATE}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.NEGATIVE_ACTIVITY,
      value: `transactions.errors.${TransactionInErrorType.NEGATIVE_ACTIVITY}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.LONG_INACTIVITY,
      value: `transactions.errors.${TransactionInErrorType.LONG_INACTIVITY}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.NO_CONSUMPTION,
      value: `transactions.errors.${TransactionInErrorType.NO_CONSUMPTION}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.OVER_CONSUMPTION,
      value: `transactions.errors.${TransactionInErrorType.OVER_CONSUMPTION}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.NEGATIVE_DURATION,
      value: `transactions.errors.${TransactionInErrorType.NEGATIVE_DURATION}.title`,
    });
    errorTypes.push({
      key: TransactionInErrorType.MISSING_USER,
      value: `transactions.errors.${TransactionInErrorType.MISSING_USER}.title`,
    });
    // If pricing is activated check that transactions have been priced
    if (this.componentService.isActive(ComponentType.PRICING)) {
      errorTypes.push({
        key: TransactionInErrorType.MISSING_PRICE,
        value: `transactions.errors.${TransactionInErrorType.MISSING_PRICE}.title`,
      });
    }
    // Sort
    errorTypes.sort((errorType1, errorType2) => {
      if (errorType1.value < errorType2.value) {
        return -1;
      }
      if (errorType1.value > errorType2.value) {
        return 1;
      }
      return 0;
    });

    const filters: TableFilterDef[] = [
      // @ts-ignore
      new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(ComponentType.ORGANIZATION)) {
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

  buildTableRowActions(): TableActionDef[] {
    const actions = [];
    if (this.authorizationService.canAccess(Entity.TRANSACTION, Action.READ)) {
      actions.push(this.openAction);
    }
    if (this.authorizationService.canAccess(Entity.TRANSACTION, Action.DELETE)) {
      actions.push(this.deleteAction);
    }
    return actions;
  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case ButtonAction.DELETE:
        if (transaction.refundData && (transaction.refundData.status === RefundStatus.SUBMITTED ||
          transaction.refundData.status === RefundStatus.APPROVED)) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('transactions.dialog.delete.title'),
            this.translateService.instant('transactions.dialog.delete.rejected_refunded_msg'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('transactions.dialog.delete.title'),
            this.translateService.instant('transactions.dialog.delete.confirm',
              {user: this.appUserNamePipe.transform(transaction.user)}),
          ).subscribe((response) => {
            if (response === ButtonType.YES) {
              this.deleteTransaction(transaction);
            }
          });
        }
        break;
      case ButtonAction.OPEN:
        this.openSession(transaction);
        break;
      default:
        super.rowActionTriggered(actionDef, transaction);
    }
  }

  buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  protected deleteTransaction(transaction: Transaction) {
    this.centralServerService.deleteTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.delete.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.refreshData().subscribe();
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.delete.error');
    });
  }

  private deleteTransactions(transactionsIDs: number[]) {
    // Yes: Update
    this.spinnerService.show();
    this.centralServerService.deleteTransactions(transactionsIDs).subscribe((response: ActionsResponse) => {
      if (response.inError) {
        this.messageService.showErrorMessage(
          this.translateService.instant('transactions.delete_transactions_partial',
            {
              inSuccess: response.inSuccess,
              inError: response.inError,
            },
          ));
      } else {
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.delete_transactions_success',
            { inSuccess: response.inSuccess },
          ));
      }
      this.spinnerService.hide();
      this.clearSelectedRows();
      this.refreshData().subscribe();
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.delete_transactions_error');
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

  private openSession(transaction: Transaction) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: transaction.id,
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialogRefSession = this.dialog.open(TransactionDialogComponent, dialogConfig);
  }
}
