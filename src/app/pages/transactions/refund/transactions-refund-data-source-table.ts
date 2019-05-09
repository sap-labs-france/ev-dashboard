import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionsResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
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
import {Constants} from '../../../utils/Constants';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {ConsumptionChartDetailComponent} from '../../../shared/component/transaction-chart/consumption-chart-detail.component';
import * as moment from 'moment';
import {TableRefundAction} from '../../../shared/table/actions/table-refund-action';
import {TransactionsTypeFilter} from './transactions-type-filter';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import {AuthorizationService} from '../../../services/authorization-service';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';
import {ComponentEnum, ComponentService} from '../../../services/component.service';

@Injectable()
export class TransactionsRefundDataSource extends TableDataSource<Transaction> {

  private isAdmin = false;
  private hasConcurConnectionConfigured = false;

  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private localeService: LocaleService,
      private router: Router,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private componentService: ComponentService,
      private authorizationService: AuthorizationService,
      private appDatePipe: AppDatePipe,
      private appUnitPipe: AppUnitPipe,
      private percentPipe: PercentPipe,
      private appConnectorIdPipe: AppConnectorIdPipe,
      private appUserNamePipe: AppUserNamePipe,
      private appDurationPipe: AppDurationPipe,
      private currencyPipe: CurrencyPipe) {
    super(spinnerService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    // Check
    this.checkConcurConnection();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      const filters = this.buildFilterValues();
      filters['UserID'] = this.centralServerService.getLoggedUser().id;
      this.centralServerService.getTransactions(filters, this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
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
      },
      rowSelection: {
        enabled: true,
        multiple: true
      },
      rowDetails: {
        enabled: false,
        angularComponent: ConsumptionChartDetailComponent
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();

    const columns = [];
    columns.push(
      {
        id: 'refundData.refundedAt',
        name: 'transactions.refundDate',
        sortable: true,
        formatter: (refundedAt, row) => !!refundedAt ? this.appDatePipe.transform(refundedAt, locale, 'datetime') : ''
      },
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
      });
    columns.push(
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (totalDurationSecs) => this.appDurationPipe.transform(totalDurationSecs)
      });
    columns.push({
      id: 'stop.totalInactivitySecs',
      name: 'transactions.inactivity',
      headerClass: 'd-none d-lg-table-cell',
      class: 'text-left d-none d-lg-table-cell',
      formatter: (totalInactivitySecs, row) => this.formatInactivity(totalInactivitySecs, row)
    });
    columns.push({
      id: 'chargeBoxID',
      name: 'transactions.charging_station',
      class: 'text-left',
      formatter: (chargingStation, row) => this.formatChargingStation(chargingStation, row)
    });
    columns.push({
      id: 'tagID',
      name: 'transactions.badge_id',
      headerClass: 'd-none d-xl-table-cell',
      class: 'text-left d-none d-xl-table-cell'
    });
    columns.push({
      id: 'stop.totalConsumption',
      name: 'transactions.total_consumption',
      formatter: (totalConsumption) => this.appUnitPipe.transform(totalConsumption, 'Wh', 'kWh')
    });
    if (this.isAdmin) {
      columns.push({
        id: 'stop.price',
        name: 'transactions.price',
        formatter: (price, row) => this.formatPrice(price, row.stop.priceUnit, locale)
      });
    }

    return columns as TableColumnDef[];
  }

  formatInactivity(totalInactivitySecs, row) {
    const percentage = row.stop.totalDurationSecs > 0 ? (totalInactivitySecs / row.stop.totalDurationSecs) : 0;
    if (percentage === 0) {
      return '';
    }
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.percentPipe.transform(percentage, '2.0-0')})`
  }

  formatChargingStation(chargingStation, row) {
    return `${chargingStation} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  formatPrice(price, priceUnit, locale): string {
    return this.currencyPipe.transform(price, priceUnit, undefined, undefined, locale);
  }

  buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [new TransactionsDateFromFilter(
      moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new TransactionsTypeFilter().getFilterDef(),
      new ChargerTableFilter().getFilterDef()];

    switch (this.centralServerService.getLoggedUser().role) {
      case  Constants.ROLE_DEMO:
      case  Constants.ROLE_BASIC:
        break;
      case  Constants.ROLE_SUPER_ADMIN:
      case  Constants.ROLE_ADMIN:
        // Show Site Area Filter If Organization component is active
        if (this.componentService.isActive(ComponentEnum.ORGANIZATION)) {
          filters.push(new SiteAreasTableFilter().getFilterDef());
        }
    }
    return filters;

  }

  buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableRefundAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  canDisplayRowAction(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'delete':
      case 'refund':
        return !transaction.hasOwnProperty('refund');
      default:
        return true;
    }
  }

  actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'refund':
        if (!this.hasConcurConnectionConfigured) {
          this.messageService.showErrorMessage(this.translateService.instant('transactions.notification.refund.concur_connection_invalid'));
        } else if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('transactions.dialog.refund.title'),
            this.translateService.instant('transactions.dialog.refund.confirm', {quantity: this.getSelectedRows().length})
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this.refundTransactions(this.getSelectedRows());
            }
          });
        }
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  isSelectable(row: Transaction) {
    return !row.refundData;
  }

  protected refundTransactions(transactions: Transaction[]) {
    this.spinnerService.show();
    this.centralServerService.refundTransactions(transactions.map(tr => tr.id)).subscribe((response: ActionsResponse) => {
      if (response.inError > 0) {
        this.messageService.showErrorMessage(
          this.translateService.instant('transactions.notification.refund.partial',
            {
              inError: response.inError,
              total: response.inError + response.inSuccess
            }
          ));
      } else {
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.refund.success',
            {inSuccess: response.inSuccess}));
      }
      this.spinnerService.hide();
      this.refreshData().subscribe();
    }, (error) => {
      this.spinnerService.hide();
      this.clearSelectedRows();

      switch (error.status) {
        case 560: // not authorized
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'transactions.notification.refund.not_authorized');
          break;
        case 551: // cannot refund another user transactions
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'transactions.notification.refund.forbidden_refund_another_user');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'transactions.notification.refund.error');
          break;
      }
    });
  }

  private checkConcurConnection() {
    if (this.authorizationService.canListSettings()) {
      this.centralServerService.getSettings(ComponentEnum.REFUND).subscribe(settingResult => {
        if (settingResult && settingResult.result && settingResult.result.length > 0) {
          this.hasConcurConnectionConfigured = true;
        }
      });
    }
  }
}
