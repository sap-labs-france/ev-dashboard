import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../shared/table/table-data-source';
import { Log, SubjectInfo, TableColumnDef, TableActionDef, TableFilterDef, TableDef } from '../../common.types';
import { CentralServerNotificationService } from '../../services/central-server-notification.service';
import { TableAutoRefreshAction } from '../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { LogSourceTableFilter } from './filters/log-source-filter';
import { LogLevelTableFilter } from './filters/log-level-filter';
import { Formatters } from '../../utils/Formatters';
import { Utils } from '../../utils/Utils';
import { LogActionTableFilter } from './filters/log-action-filter';
import { LogDateTableFilter } from './filters/log-date-filter';
import { UserTableFilter } from '../../shared/table/filters/user-filter';
import { ChargerTableFilter } from '../../shared/table/filters/charger-filter';

export class LogDataSource extends TableDataSource<Log> {
  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get data
    this.centralServerService.getLogs(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((logs) => {
        // Show
        this.spinnerService.hide();
        // Set number of records
        this.setNumberOfRecords(logs.count);
        // Update page length
        this.updatePaginator();
        // Add the users in the message
        logs.result.map((log) => {
          let user;
          // Set User
          if (log.user) {
            user = log.user;
          }
          // Set Action On User
          if (log.actionOnUser) {
            user = (user ? `${user} > ${log.actionOnUser}` : log.actionOnUser);
          }
          // Set
          if (user) {
            log.message = `${user} > ${log.message}`;
          }
          return log;
        });
        // Return logs
        this.getDataSubjet().next(logs.result);
        // Keep the result
        this.setData(logs.result);
      }, (error) => {
        // Show
        this.spinnerService.hide();
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getRowDetails(row: Log): Observable<String> {
    // Read the log details
    return this.centralServerService.getLog(row.id)
      .map((log => Formatters.formatTextToHTML(log.detailedMessages)));
  }

  public getTableDef(): TableDef {
    return {
      search: {
          enabled: true
      },
      rowDetails: {
        enabled: true,
        detailsField: 'detailedMessages',
        hideShowField: 'hasDetailedMessages'
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    return [
      {
        id: 'level',
        name: this.translateService.instant('logs.level'),
        formatter: Formatters.formatLogLevel,
        formatterOptions: { iconClass: 'pt-1' },
        headerClass: 'col-75',
        class: 'col-75'
      },
      {
        id: 'timestamp',
        type: 'date',
        formatter: Formatters.createDateTimeFormatter(this.localeService).format,
        name: this.translateService.instant('logs.date'),
        headerClass: 'col-175',
        class: 'text-left col-175',
        sorted: true,
        direction: 'desc'
      },
      {
        id: 'source',
        name: this.translateService.instant('logs.source'),
        headerClass: 'col-150',
        class: 'text-left col-150'
      },
      {
        id: 'action',
        name: this.translateService.instant('logs.action'),
        headerClass: 'col-225',
        class: 'text-left col-200'
      },
      {
        id: 'message',
        name: this.translateService.instant('logs.message'),
        headerClass: 'col-600',
        class: 'text-left col-600'
      }
    ];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction(this.translateService).getActionDef()
    ];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(this.translateService, false).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new LogDateTableFilter(this.translateService).getFilterDef(),
      new LogLevelTableFilter(this.translateService, this.centralServerService).getFilterDef(),
      new LogSourceTableFilter(this.translateService).getFilterDef(),
      new UserTableFilter(this.translateService).getFilterDef(),
      new LogActionTableFilter(this.translateService, this.centralServerService).getFilterDef()
    ];
  }
}
