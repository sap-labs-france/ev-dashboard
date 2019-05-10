import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsDateFromFilter} from '../filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from '../filters/transactions-date-until-filter';
import {CurrencyPipe} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {LocaleService} from '../../../services/locale.service';
import {TableDeleteAction} from '../../../shared/table/actions/table-delete-action';
import {Constants} from '../../../utils/Constants';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {TableOpenAction} from '../../../shared/table/actions/table-open-action';
import {SessionDialogComponent} from '../../../shared/dialogs/session/session-dialog-component';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import {ErrorMessage} from '../../../shared/dialogs/error-details/error-code-details-dialog.component';
import {ErrorCodeDetailsComponent} from '../../../shared/component/error-details/error-code-details.component';
import {ErrorTypeTableFilter} from '../../../shared/table/filters/error-type-filter';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import en from '../../../../assets/i18n/en.json';
import * as moment from 'moment';
import { AuthorizationService } from 'app/services/authorization-service';
import { SpinnerService } from 'app/services/spinner.service';
import { WindowService } from 'app/services/window.service';


@Injectable()
export class TransactionsInErrorDataSource extends TableDataSource<Transaction> {
  private isAdmin = false;
  private dialogRefSession;

  constructor(
      public spinnerService: SpinnerService,
      public windowService: WindowService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private localeService: LocaleService,
      private router: Router,
      private dialog: MatDialog,
      private componentService: ComponentService,
      private authorizationService: AuthorizationService,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private appDatePipe: AppDatePipe,
      private currencyPipe: CurrencyPipe,
      private appConnectorIdPipe: AppConnectorIdPipe,
      private appUserNamePipe: AppUserNamePipe) {
        super(spinnerService, windowService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl() {
    return new Observable((observer) => {
      this.centralServerService.getTransactionsInError(this.buildFilterValues(), this.getPaging(), this.getSorting())
          .subscribe((transactions) => {
        this.formatErrorMessages(transactions.result);
        this.setTotalNumberOfRecords(transactions.count);
        // Ok
        observer.next(transactions.result);
        observer.complete();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    const columns = [
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        class: 'text-left',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.appDatePipe.transform(value, locale, 'datetime')
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left',
        formatter: (chargingStation, row) => this.formatChargingStation(chargingStation, row)
      },
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        class: 'action-cell text-left',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        sortable: true,
        formatter: (value, row) => this.translateService.instant(`transactions.errors.${row.errorCode}.title`)
      },
      {
        id: 'errorCodeDescription',
        name: 'errors.description',
        sortable: false,
        formatter: (value, row) => this.translateService.instant(`transactions.errors.${row.errorCode}.description`)
      }
    ];
    if (this.isAdmin) {
      columns.splice(1, 0, {
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value) => this.appUserNamePipe.transform(value)
      });
    }
    return columns as TableColumnDef[];
  }

  formatChargingStation(chargingStation, row) {
    return `${chargingStation} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  formatPrice(price, priceUnit): string {
    return this.currencyPipe.transform(price, priceUnit);
  }

  buildTableFiltersDef(): TableFilterDef[] {
    const errorTypes = Object.keys(en.transactions.errors).map(key => ({key: key, value: `transactions.errors.${key}.title`}));

    const filters: TableFilterDef[] = [
      new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
      new ChargerTableFilter().getFilterDef()
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(ComponentEnum.ORGANIZATION)) {
      filters.push(new SiteAreasTableFilter().getFilterDef());
    }

    switch (this.centralServerService.getLoggedUser().role) {
      case  Constants.ROLE_DEMO:
      case  Constants.ROLE_BASIC:
        break;
      case  Constants.ROLE_SUPER_ADMIN:
      case  Constants.ROLE_ADMIN:
        filters.push(new UserTableFilter().getFilterDef());
    }
    return filters;
  }

  buildTableRowActions(): TableActionDef[] {
    return [
      new TableOpenAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'delete':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('transactions.dialog.delete.title'),
          this.translateService.instant('transactions.dialog.delete.confirm', {user: this.appUserNamePipe.transform(transaction.user)})
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this._deleteTransaction(transaction);
          }
        });
        break;
      case 'open':
        this._openSession(transaction);
        break;
      default:
        super.rowActionTriggered(actionDef, transaction);
    }
  }

  buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  protected _deleteTransaction(transaction: Transaction) {
    this.centralServerService.deleteTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.delete.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.refreshData().subscribe();
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.delete.error');
    });
  }

  private formatErrorMessages(transactions) {
    transactions.forEach(transaction => {
      const path = `transactions.errors.${transaction.errorCode}`;
      const errorMessage = new ErrorMessage(`${path}.title`, {}, `${path}.description`, {}, `${path}.action`, {});
      switch (transaction.errorCode) {
        case'noConsumption':
          // nothing to do
          break;
      }
      transaction.errorMessage = errorMessage;
    });
  }

  private _openSession(transaction: Transaction) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: transaction.id
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
    this.dialogRefSession.afterClosed().subscribe(() => this.refreshData().subscribe());
  }
}
