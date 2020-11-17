import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { logLevels } from '../../../shared/model/logs.model';
import { TableExportLogsAction, TableExportLogsActionDef } from '../../../shared/table/actions/logs/table-export-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { EndDateFilter } from '../../../shared/table/filters/end-date-filter';
import { StartDateFilter } from '../../../shared/table/filters/start-date-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { Log, LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Formatters } from '../../../utils/Formatters';
import { Utils } from '../../../utils/Utils';
import { LogActionTableFilter } from '../filters/log-action-filter';
import { LogHostTableFilter } from '../filters/log-host-filter';
import { LogLevelTableFilter } from '../filters/log-level-filter';
import { LogSourceTableFilter } from '../filters/log-source-filter';
import { LogLevelFormatterComponent } from '../formatters/log-level-formatter.component';

@Injectable()
export class LogsListTableDataSource extends TableDataSource<Log> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private authorizationService: AuthorizationService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private windowService: WindowService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    // Server Actions
    const actions = this.windowService.getSearch('actions');
    if (actions) {
      const logActionTableFilter = this.tableFiltersDef.find(filter => filter.id === 'action');
      if (logActionTableFilter) {
        for (const action of actions.split('|')) {
          logActionTableFilter.currentValue.push({
            key: action, value: action
          });
        }
        this.filterChanged(logActionTableFilter);
      }
    }
    // Charging Station
    const chargingStationID = this.windowService.getSearch('ChargingStationID');
    if (chargingStationID) {
      const logSourceTableFilter = this.tableFiltersDef.find(filter => filter.id === 'charger');
      if (logSourceTableFilter) {
        logSourceTableFilter.currentValue = [{ key: chargingStationID, value: chargingStationID }];
        this.filterChanged(logSourceTableFilter);
      }
    }
    // Log Level
    const logLevel = this.windowService.getSearch('LogLevel');
    if (logLevel) {
      const logLevelTableFilter = this.tableFiltersDef.find(filter => filter.id === 'level');
      if (logLevelTableFilter) {
        logLevelTableFilter.currentValue = [logLevels.find(logLevelObject => logLevelObject.key === logLevel)];
        this.filterChanged(logLevelTableFilter);
      }
    }
    // Timestamp
    const timestamp = this.windowService.getSearch('Timestamp');
    if (timestamp) {
      const startDateFilter = this.tableFiltersDef.find(filter => filter.id === 'dateFrom');
      if (startDateFilter) {
        startDateFilter.currentValue = moment(timestamp).toDate();
        this.filterChanged(startDateFilter);
        const timestampColumn = this.tableColumnsDef.find(column => column.id === 'timestamp');
        if (timestampColumn) {
          this.tableColumnsDef.forEach((column) => {
            if (column.id === timestampColumn.id) {
              column.sorted = true;
              column.direction = 'asc';
            } else {
              column.sorted = false;
            }
          });
        }
      }
    }
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadDataImpl(): Observable<DataResult<Log>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getLogs(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((logs) => {
          // Add the users in the message
          logs.result.map((log: Log) => {
            let user;
            // Set User
            if (log.user) {
              user = Utils.buildUserFullName(log.user);
            }
            // Set Action On User
            if (log.actionOnUser) {
              user = (user ? `${user} > ${Utils.buildUserFullName(log.actionOnUser)}` : Utils.buildUserFullName(log.actionOnUser));
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

  public getRowDetails(row: Log): Observable<string> {
    // Read the log details
    return this.centralServerService.getLog(row.id).pipe(
      map((log) => Formatters.formatTextToHTML(log.detailedMessages)));
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowDetails: {
        enabled: true,
        detailsField: 'detailedMessages',
        showDetailsField: 'hasDetailedMessages',
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'level',
        name: 'logs.level',
        isAngularComponent: true,
        angularComponent: LogLevelFormatterComponent,
        headerClass: 'col-7p text-center',
        class: 'col-7p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'timestamp',
        type: 'date',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        name: 'logs.date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: true,
      },
      {
        id: 'action',
        name: 'logs.action',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'source',
        name: 'logs.source',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'message',
        name: 'logs.message',
        headerClass: 'col-50p',
        class: 'text-left col-50p',
        sortable: true,
      },
      {
        id: 'host',
        name: 'logs.host',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'process',
        name: 'logs.process',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (!this.authorizationService.isDemo()) {
      return [
        new TableExportLogsAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case LogButtonAction.EXPORT_LOGS:
        if (actionDef.action) {
          (actionDef as TableExportLogsActionDef).action(this.buildFilterValues(), this.dialogService,
            this.translateService, this.messageService, this.centralServerService, this.router,
            this.spinnerService);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const tableFiltersDef = [
      new StartDateFilter().getFilterDef(),
      new EndDateFilter().getFilterDef(),
      new LogLevelTableFilter().getFilterDef(),
      new LogActionTableFilter().getFilterDef(),
      new LogHostTableFilter().getFilterDef(),
    ];
    if (this.authorizationService.isSuperAdmin()) {
      tableFiltersDef.push(new UserTableFilter().getFilterDef());
      return tableFiltersDef;
    }
    if (this.authorizationService.isAdmin()) {
      tableFiltersDef.push(new UserTableFilter().getFilterDef());
      tableFiltersDef.push(new LogSourceTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    } else {
      tableFiltersDef.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
      tableFiltersDef.push(new LogSourceTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }
    return tableFiltersDef;
  }
}
