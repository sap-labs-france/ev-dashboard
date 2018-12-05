import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from '../filters/transactions-charger-filter';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {PercentPipe} from '@angular/common';
import {Constants} from '../../../utils/Constants';
import {DialogService} from '../../../services/dialog.service';
import {TableStopAction} from './actions/table-stop-action';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {map, zipAll} from 'rxjs/operators';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {ConnectorCellComponent} from './components/connector-cell.component';
import {LocaleService} from '../../../services/locale.service';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';

@Injectable()
export class TransactionsInProgressDataSource extends TableDataSource<Transaction> {

  private readonly tableActionsRow: TableActionDef[];

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
    private percentPipe: PercentPipe,
    private appUnitPipe: AppUnitPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe) {
    super()
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData() {
    this.spinnerService.show();
    this.centralServerService.getActiveTransactions(this.getFilterValues(), this.getPaging(), this.getOrdering())
      .subscribe((transactions) => {
        this.spinnerService.hide();
        this.setNumberOfRecords(transactions.count);
        this.updatePaginator();
        this.getDataSubjet().next(transactions.result);
        this.setData(transactions.result);
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-list-under-tabs',
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();

    return [
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.appDatePipe.transform(value, locale, 'datetime')
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center col-5p',
        class: 'text-center col-5p',
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent,
      },

      {
        id: 'totalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (totalDurationSecs) => this.appDurationPipe.transform(totalDurationSecs)
      },
      {
        id: 'totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (totalInactivitySecs, row) => {
          const percentage = row.totalDurationSecs > 0 ? (totalInactivitySecs / row.totalDurationSecs) : 0;
          if (percentage === 0) {
            return '';
          }
          return this.appDurationPipe.transform(totalInactivitySecs) +
            ` (${this.percentPipe.transform(percentage, '2.0-0')})`
        }
      },
      {
        id: 'user',
        name: 'transactions.user',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        formatter: (value) => this.appUserNamePipe.transform(value)
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (totalConsumption) => this.appUnitPipe.transform(totalConsumption, 'Wh', 'kWh')
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentConsumption) => currentConsumption > 0 ? this.appUnitPipe.transform(currentConsumption, 'W', 'kW') : ''
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentStateOfCharge, row) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return `${this.percentPipe.transform(row.stateOfCharge / 100, '2.0-0')} > ` +
            `${this.percentPipe.transform(currentStateOfCharge / 100, '2.0-0')} ` +
            `(${this.percentPipe.transform((currentStateOfCharge - row.stateOfCharge) / 100, '2.0-0')})`;
        }
      }
    ];
  }

  getTableActionsDef(): TableActionDef[] {
    return [
      new TableStopAction().getActionDef()
    ];
  }

  actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'stop':
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.dialog,
            this.translateService.instant('transactions.dialog.soft_stop.title'),
            this.translateService.instant('transactions.dialog.soft_stop.confirm', {count: this.getSelectedRows().length})
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {

              this._stopTransactions(this.getSelectedRows());
            }
          });
        }
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }


  getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }

  getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  private _stopTransactions(transactions: Transaction[]) {
    const isActive = (status) => status === 'Available';
    this._softStopTransactions(transactions.filter(transaction => isActive(transaction.status)));
    this._stationStopTransactions(transactions.filter(transaction => !isActive(transaction.status)));
  }

  private _stationStopTransactions(transactions: Transaction[]) {
    from(transactions).pipe(
      map((transaction: Transaction) => this.centralServerService.stationStopTransaction(transaction.chargeBoxID, transaction.id)),
      zipAll())
      .subscribe((responses: ActionResponse[]) => {
        const successCount = responses.filter(response => response.status === 'Accepted').length;
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.soft_stop.success', {count: successCount}));
        this.clearSelectedRows();
        this.loadData();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('transactions.notification.soft_stop.error'));
      });
  }

  private _softStopTransactions(transactions: Transaction[]) {
    from(transactions).pipe(
      map((transaction: Transaction) => this.centralServerService.softStopTransaction(transaction.id)),
      zipAll())
      .subscribe((responses: ActionResponse[]) => {
        const successCount = responses.filter(response => response.status === 'Accepted').length;
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.soft_stop.success', {count: successCount}));
        this.clearSelectedRows();
        this.loadData();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('transactions.notification.soft_stop.error'));
      });
  }
}
