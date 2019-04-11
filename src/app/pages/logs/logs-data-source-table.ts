import {Observable} from 'rxjs';
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
import {LogSourceTableFilter} from './filters/log-source-filter';
import {LogLevelTableFilter} from './filters/log-level-filter';
import {Formatters} from '../../utils/Formatters';
import {Utils} from '../../utils/Utils';
import {LogActionTableFilter} from './filters/log-action-filter';
import {LogDateFromTableFilter} from './filters/log-date-from-filter';
import {LogDateUntilTableFilter} from './filters/log-date-until-filter';
import {UserTableFilter} from '../../shared/table/filters/user-filter';
import {AppDatePipe} from '../../shared/formatters/app-date.pipe';
import {LogLevelComponent} from './formatters/log-level.component';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Constants} from '../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';
import {DialogService} from '../../services/dialog.service';
import {MatDialog} from '@angular/material';
import saveAs from 'file-saver';
import {TableExportAction} from '../../shared/table/actions/table-export-action';
import {AuthorizationService} from '../../services/authorization-service';

const POLL_INTERVAL = 10000;

@Injectable()
export class LogsDataSource extends TableDataSource<Log> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private localeService: LocaleService,
      private dialogService: DialogService,
      private spinnerService: SpinnerService,
      private authorizationService: AuthorizationService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private datePipe: AppDatePipe) {
    super();
    console.log('logs-data-source-table - constructor');
    // Init
    this.initDataSource();
    // Set polling interval
    this.setPollingInterval(POLL_INTERVAL);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    console.log('logs-data-source-table - getDataChangeSubject');
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadData(refreshAction = false): Observable<any> {
    console.log('logs-data-source-table - loadData');
    return new Observable((observer) => {
      if (!refreshAction) {
        // Show
        this.spinnerService.show();
      }
      // Get data
      this.centralServerService.getLogs(this.buildFilterValues(),
        this.buildPaging(), this.buildOrdering()).subscribe((logs) => {
        if (!refreshAction) {
          // Show
          this.spinnerService.hide();
        }
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
        // Ok
        observer.next(logs.result);
        observer.complete();
      }, (error) => {
        // Show
        this.spinnerService.hide();
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public getRowDetails(row: Log): Observable<String> {
    console.log('logs-data-source-table - getRowDetails');
    // Read the log details
    return this.centralServerService.getLog(row.id).pipe(
      map(log => Formatters.formatTextToHTML(log.detailedMessages)));
  }

  public buildTableDef(): TableDef {
    console.log('logs-data-source-table - buildTableDef');
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

  public buildTableColumnDefs(): TableColumnDef[] {
    console.log('logs-data-source-table - buildTableColumnDefs');
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'level',
        name: 'logs.level',
        isAngularComponent: true,
        angularComponentName: LogLevelComponent,
        headerClass: 'col-7p',
        class: 'col-7p',
        sortable: true
      },
      {
        id: 'timestamp',
        type: 'date',
        formatter: (createdOn) => this.datePipe.transform(createdOn, locale, 'datetime'),
        name: 'logs.date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: true
      },
      {
        id: 'source',
        name: 'logs.source',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true
      },
      {
        id: 'action',
        name: 'logs.action',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true
      },
      {
        id: 'message',
        name: 'logs.message',
        headerClass: 'col-50p',
        class: 'text-left col-50p',
        sortable: true
      }
    ];
  }

  public getPaginatorPageSizes() {
    console.log('logs-data-source-table - getPaginatorPageSizes');
    return [50, 100, 250, 500, 1000, 2000];
  }

  buildTableActionsDef(): TableActionDef[] {
    console.log('logs-data-source-table - buildTableActionsDef');
    const tableActionsDef = super.buildTableActionsDef();
    if (!this.authorizationService.isDemo()) {
      return [
        new TableExportAction().getActionDef(),
        ...tableActionsDef
      ];
    } else {
      return tableActionsDef;
    }
  }

  actionTriggered(actionDef: TableActionDef) {
    console.log('logs-data-source-table - actionTriggered');
    switch (actionDef.id) {
      case 'export':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('logs.dialog.export.title'),
          this.translateService.instant('logs.dialog.export.confirm')
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.exportLogs();
          }
        });
        break;
    }
    super.actionTriggered(actionDef);
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    console.log('logs-data-source-table - buildTableActionsRightDef');
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    console.log('logs-data-source-table - buildTableFiltersDef');
    if (this.authorizationService.isSuperAdmin()) {
      return [
        new LogDateFromTableFilter().getFilterDef(),
        new LogDateUntilTableFilter().getFilterDef(),
        new LogLevelTableFilter().getFilterDef(),
        new LogActionTableFilter().getFilterDef(),
        new UserTableFilter().getFilterDef()
      ];
    } else if (this.authorizationService.isAdmin()) {
      return [
        new LogDateFromTableFilter().getFilterDef(),
        new LogDateUntilTableFilter().getFilterDef(),
        new LogLevelTableFilter().getFilterDef(),
        new LogActionTableFilter().getFilterDef(),
        new LogSourceTableFilter().getFilterDef(),
        new UserTableFilter().getFilterDef()
      ];
    } else {
      return [];
    }
  }

  private exportLogs() {
    console.log('logs-data-source-table - exportLogs');
    this.centralServerService.exportLogs(this.buildFilterValues(), {
      limit: this.getNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP
    }, this.buildOrdering())
      .subscribe((result) => {
        saveAs(result, 'exportLogs.csv');
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }
}
