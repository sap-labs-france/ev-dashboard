import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../../services/central-server.service';
import {LocaleService} from '../../../services/locale.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from '../filters/transactions-charger-filter';
import {AppKiloUnitPipe} from '../../../shared/formatters/app-kilo-unit.pipe';
import {PercentPipe} from '@angular/common';
import {Constants} from '../../../utils/Constants';
import {DialogService} from '../../../services/dialog.service';
import {TableStopAction} from './actions/table-stop-action';
import * as moment from 'moment'
import {TransactionStateIconPipe} from './formatters/transaction-state-icon.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {AppDateTimePipe} from '../../../shared/formatters/app-date-time.pipe';

export class TransactionsInProgressDataSource extends TableDataSource<Transaction> {
  private readonly tableActionsRow: TableActionDef[];
  private i = 0;

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private appDateTimePipe: AppDateTimePipe) {
    super();
    this.i = 0;
    this.tableActionsRow = [
      new TableStopAction().getActionDef()
    ];
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
        formatter: this.appDateTimePipe.transform,
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sorted: true,
        sortable: true,
        direction: 'asc'
      },
      {
        id: 'isLoading',
        name: 'transactions.state',
        formatter: (isLoading) => new TransactionStateIconPipe().transform(isLoading, {iconClass: 'pt-1'}),
        headerClass: 'text-center col-5p',
        class: 'text-center col-5p',
      },
      {
        id: 'totalDurationSecs',
        additionalIds: ['timestamp'],
        name: 'transactions.duration',
        formatter: (totalDurationSecs, startDate) => {
          return new AppDurationPipe().transform(moment.duration(moment().diff(startDate)).asSeconds());
        },
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'totalInactivitySecs',
        additionalIds: ['totalDurationSecs', 'timestamp'],
        name: 'transactions.inactivity',
        formatter: (totalInactivitySecs, totalDurationSecs, startDate) => {
          console.log(`getTableColumnDefs ${this.i++}`);
          const now = moment();
          const totalDuration = moment.duration(now.diff(startDate)).asSeconds();
          const totalInactivity = moment.duration(now.diff(moment(startDate).add(totalDurationSecs - totalInactivitySecs, 'seconds'))).asSeconds();
          const percentage = totalDuration > 0 ? (totalInactivity / totalDuration) : 0;
          return new AppDurationPipe().transform(totalInactivity) +
            ` (${new PercentPipe(locale).transform(percentage, '2.0-0')})`
        },
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'user',
        name: 'transactions.user',
        formatter: new AppUserNamePipe().transform,
        headerClass: 'col-15p',
        class: 'text-left col-15p'
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'chargeBoxID',
        additionalIds: ['connectorId'],
        name: 'transactions.charging_station',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (chargeBoxID, connectorId) => `${chargeBoxID} (${connectorId})`
      },
      {
        id: 'totalConsumption',
        additionalIds: ['currentConsumption'],
        name: 'transactions.total_consumption',
        headerClass: 'text-right col-10p',
        class: 'text-right col-10p',
        formatter: (totalConsumption, currentConsumption) => `${new AppKiloUnitPipe(locale).transform(totalConsumption, 'kW')} (${new AppKiloUnitPipe(locale).transform(currentConsumption, 'kWh')})`
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'stop':
        this._softStopTransaction(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  private _softStopTransaction(transaction) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('transactions.soft_stop_title'),
      this.translateService.instant('transactions.soft_stop_confirm', {'name': transaction.name})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.softStopTransaction(transaction.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.loadData();
            this.messageService.showSuccessMessage('transactions.soft_stop_success', {'name': transaction.name});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'transactions.soft_stop_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'transactions.soft_stop_error');
        });
      }
    });
  }
}
