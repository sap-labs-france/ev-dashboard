import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsDateFromFilter} from '../filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from '../filters/transactions-date-until-filter';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {CurrencyPipe, PercentPipe} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {LocaleService} from '../../../services/locale.service';
import {TableDeleteAction} from '../../../shared/table/actions/table-delete-action';
import {Constants} from '../../../utils/Constants';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {TableOpenAction} from '../../../shared/table/actions/table-open-action';
import {SessionDialogComponent} from '../../../shared/dialogs/session/session-dialog-component';
import * as moment from 'moment';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import {ErrorMessage} from '../../../shared/dialogs/error-details/error-code-details-dialog.component';
import {ErrorCodeDetailsComponent} from '../../../shared/component/error-details/error-code-details.component';
import {ErrorTypeTableFilter} from '../../../shared/table/filters/error-type-filter';
import en from '../../../../assets/i18n/en.json';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';

const POLL_INTERVAL = 10000;

@Injectable()
export class TransactionsInErrorDataSource extends TableDataSource<Transaction> {

  private isAdmin = false;
  private dialogRefSession;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private localeService: LocaleService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private appDatePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private percentPipe: PercentPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe,
    private  currencyPipe: CurrencyPipe) {
    super();
    this.setPollingInterval(POLL_INTERVAL);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData(refreshAction = false) {
    if (!refreshAction) {
      this.spinnerService.show();
    }
    this.centralServerService.getTransactionsInError(this.getFilterValues(), this.getPaging(), this.getOrdering())
      .subscribe((transactions) => {
        if (!refreshAction) {
          this.spinnerService.hide();
        }
        this.formatErrorMessages(transactions.result);
        this.setNumberOfRecords(transactions.count);
        this.updatePaginator();
        this.setData(transactions.result);
      }, (error) => {
        if (!refreshAction) {
          this.spinnerService.hide();
        }
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });

  }

  public getTableDef(): TableDef {
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
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value) => this.appUserNamePipe.transform(value)
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (totalDurationSecs) => this.appDurationPipe.transform(totalDurationSecs)
      },
      {
        id: 'stop.totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'd-none d-lg-table-cell',
        class: 'text-left d-none d-lg-table-cell',
        formatter: (totalInactivitySecs, row) => this.formatInactivity(totalInactivitySecs, row)
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left',
        formatter: (chargingStation, row) => this.formatChargingStation(chargingStation, row)
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'd-none d-xl-table-cell',
        class: 'text-left d-none d-xl-table-cell'
      },
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        class: 'action-cell text-left',
        isAngularComponent: true,
        angularComponentName: ErrorCodeDetailsComponent
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        sortable: true,
        formatter: (value, row) => this.translateService.instant(row.errorMessage.title)
      },
      {
        id: 'errorCodeDescription',
        name: 'errors.description',
        sortable: false,
        formatter: (value, row) => this.translateService.instant(row.errorMessage.description)
      }
    ];
    if (this.isAdmin) {
      columns.push({
        id: 'stop.price',
        name: 'transactions.price',
        headerClass: 'd-none d-xl-table-cell',
        class: 'd-none d-xl-table-cell',
        formatter: (price, row) => this.formatPrice(price, row.stop.priceUnit)
      })
    }
    return columns as TableColumnDef[];
  }

  formatInactivity(totalInactivitySecs, row) {
    const percentage = row.stop.totalDurationSecs > 0 ? (totalInactivitySecs / row.stop.totalDurationSecs) : 0;
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.percentPipe.transform(percentage, '1.0-0')})`
  }

  formatChargingStation(chargingStation, row) {
    return `${chargingStation} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  formatPrice(price, priceUnit): string {
    return this.currencyPipe.transform(price, priceUnit);
  }

  getTableFiltersDef(): TableFilterDef[] {
    const errorTypes = Object.keys(en.transactions.errors).map(key => ({key: key, value: `transactions.errors.${key}.title`}));

    const filters: TableFilterDef[] = [new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
      new ChargerTableFilter().getFilterDef(),
      new SiteAreasTableFilter().getFilterDef()];
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

  getTableRowActions(): TableActionDef[] {
    return [new TableOpenAction().getActionDef(), new TableDeleteAction().getActionDef()];
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

  getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  forAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin
  }

  protected _deleteTransaction(transaction: Transaction) {
    this.centralServerService.deleteTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.delete.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.loadData();
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

    this.centralServerService.getSiteArea(transaction.siteAreaID, true, true).subscribe(siteArea => {
        const chargeBox = siteArea.chargeBoxes.find(c => c.id === transaction.chargeBoxID);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.minWidth = '80vw';
        dialogConfig.minHeight = '80vh';
        dialogConfig.height = '80vh';
        dialogConfig.width = '80vw';
        dialogConfig.panelClass = 'transparent-dialog-container';
        dialogConfig.data = {
          transactionId: transaction.id,
          siteArea: siteArea,
          connector: chargeBox.connectors[transaction.connectorId],
        };
        // Open
        this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
      }
    )
  }
}
