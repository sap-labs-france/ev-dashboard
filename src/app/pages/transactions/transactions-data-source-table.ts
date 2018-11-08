import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {MatDialog} from '@angular/material';
import {UserTableFilter} from '../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from './filters/transactions-charger-filter';
import {TransactionsDateFromFilter} from './filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from './filters/transactions-date-until-filter';
import {KiloWattPipe} from '../../shared/formatters/kilo-watt.pipe';
import {UserNamePipe} from '../../shared/formatters/user-name.pipe';
import {DurationPipe} from '../../shared/formatters/duration.pipe';
import {PercentPipe} from '@angular/common';
import {DateTimePipe} from '../../shared/formatters/date-time.pipe';

export class TransactionsDataSource extends TableDataSource<Transaction> {
  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData() {
    this.spinnerService.show();
    this.centralServerService.getTransactions(this.getFilterValues(), this.getPaging(), this.getOrdering())
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
        enabled: true
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'timestamp',
        name: 'transactions.date_from',
        formatter: new DateTimePipe(locale).transform,
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'asc'
      },
      {
        id: 'totalDurationInSecs',
        name: 'transactions.duration',
        formatter: new DurationPipe().transform,
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'totalInactivitySecs',
        additionalIds: ['totalDurationInSecs'],
        name: 'transactions.inactivity',
        formatter: (totalInactivitySecs, totalDurationInSecs) => {
          const percentage = totalDurationInSecs > 0 ? totalInactivitySecs / totalDurationInSecs : 0;
          return new DurationPipe().transform(totalInactivitySecs) +
            ` (${new PercentPipe(locale).transform(percentage, '2.0-0')})`
        },
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'user',
        name: 'transactions.user',
        formatter: new UserNamePipe().transform,
        headerClass: 'col-10p',
        class: 'text-left col-10p'
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
        class: 'text-left col-10p'
      },
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption',
        headerClass: 'text-right col-5p',
        class: 'text-right col-5p',
        formatter: new KiloWattPipe().transform
      },
      {
        id: 'totalPrice',
        name: 'transactions.price',
        headerClass: 'text-right col-5p',
        class: 'text-right col-5p'
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
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
      new TransactionsDateFromFilter().getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }
}
