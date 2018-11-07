import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {Log, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {MatDialog} from '@angular/material';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {UserTableFilter} from '../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from './filters/transactions-charger-filter';
import {TransactionsDateFromFilter} from './filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from './filters/transactions-date-until-filter';
import {Formatters} from '../../utils/Formatters';

export class TransactionsDataSource extends TableDataSource<Log> {
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
    return [
      {
        id: 'timestamp',
        name: this.translateService.instant('transactions.date_from'),
        type: 'date',
        formatter: Formatters.createDateTimeFormatter(this.localeService).format,
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'asc'
      },
      {
        id: 'totalDurationInSecs',
        name: this.translateService.instant('transactions.duration'),
        formatter: Formatters.formatDurationInSecs,
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'totalInactivitySecs',
        additionalIds: ['totalDurationInSecs'],
        name: this.translateService.instant('transactions.inactivity'),
        formatter: Formatters.formatInactivityInSecs,
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'user',
        name: this.translateService.instant('transactions.user'),
        formatter: Formatters.formatUser,
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'tagID',
        name: this.translateService.instant('transactions.badge_id'),
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'chargeBoxID',
        name: this.translateService.instant('transactions.charging_station'),
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'connectorId',
        name: this.translateService.instant('transactions.connector'),
        headerClass: 'col-5p',
        class: 'text-center col-5p'
      },
      {
        id: 'totalConsumption',
        name: this.translateService.instant('transactions.total_consumption'),
        headerClass: 'col-5p',
        class: 'text-right col-5p',
        formatter: Formatters.formatToKiloWatt
      },
      {
        id: 'totalPrice',
        name: this.translateService.instant('transactions.price'),
        headerClass: 'col-5p',
        class: 'text-right col-5p'
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction(this.translateService).getActionDef()
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
      new TableAutoRefreshAction(this.translateService, false).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsDateFromFilter(this.translateService).getFilterDef(),
      new TransactionsDateUntilFilter(this.translateService).getFilterDef(),
      new TransactionsChargerFilter(this.translateService).getFilterDef(),
      new UserTableFilter(this.translateService).getFilterDef(),
    ];
  }
}
