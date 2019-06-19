import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import saveAs from 'file-saver';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Log, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../common.types';
import { AuthorizationService } from '../../services/authorization-service';
import { CentralServerNotificationService } from '../../services/central-server-notification.service';
import { CentralServerService } from '../../services/central-server.service';
import { DialogService } from '../../services/dialog.service';
import { MessageService } from '../../services/message.service';
import { AppDatePipe } from '../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../shared/table/actions/table-auto-refresh-action';
import { TableExportAction } from '../../shared/table/actions/table-export-action';
import { TableRefreshAction } from '../../shared/table/actions/table-refresh-action';
import { UserTableFilter } from '../../shared/table/filters/user-filter';
import { TableDataSource } from '../../shared/table/table-data-source';
import { Constants } from '../../utils/Constants';
import { Formatters } from '../../utils/Formatters';
import { Utils } from '../../utils/Utils';
import { LogActionTableFilter } from './filters/log-action-filter';
import { LogDateFromTableFilter } from './filters/log-date-from-filter';
import { LogDateUntilTableFilter } from './filters/log-date-until-filter';
import { LogHostTableFilter } from './filters/log-host-filter';
import { LogLevelTableFilter } from './filters/log-level-filter';
import { LogSourceTableFilter } from './filters/log-source-filter';
import { LogLevelComponent } from './formatters/log-level.component';

@Injectable()
export class LogsDataSource extends TableDataSource<Log> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private authorizationService: AuthorizationService,
      private router: Router,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getLogs(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((logs) => {
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
        observer.next(logs);
        observer.complete();
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public getRowDetails(row: Log): Observable<String> {
    // Read the log details
    return this.centralServerService.getLog(row.id).pipe(
      map(log => Formatters.formatTextToHTML(log.detailedMessages)));
  }

  public getPageSize(): number {
    return 200;
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowDetails: {
        enabled: true,
        detailsField: 'detailedMessages',
        showDetailsField: 'hasDetailedMessages'
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'level',
        name: 'logs.level',
        isAngularComponent: true,
        angularComponent: LogLevelComponent,
        headerClass: 'col-7p',
        class: 'col-7p',
        sortable: true
      },
      {
        id: 'timestamp',
        type: 'date',
        formatter: (createdOn) => this.datePipe.transform(createdOn),
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
        id: 'host',
        name: 'logs.host',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true
      },
      {
        id: 'process',
        name: 'logs.process',
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

  buildTableActionsDef(): TableActionDef[] {
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
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
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
        // new LogHostTableFilter().getFilterDef(),
        new UserTableFilter().getFilterDef()
      ];
    } else {
      return [];
    }
  }

  private exportLogs() {
    this.centralServerService.exportLogs(this.buildFilterValues(), {
      limit: this.getTotalNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP
    }, this.getSorting())
      .subscribe((result) => {
        saveAs(result, 'exportLogs.csv');
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }
}
