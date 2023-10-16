import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentService } from 'services/component.service';
import { ChargingStationTableFilter } from 'shared/table/filters/charging-station-table-filter';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import { TenantComponents } from 'types/Tenant';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { logLevels } from '../../../shared/model/logs.model';
import {
  TableExportLogsAction,
  TableExportLogsActionDef,
} from '../../../shared/table/actions/logs/table-export-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult } from '../../../types/DataResult';
import { Log, LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Formatters } from '../../../utils/Formatters';
import { Utils } from '../../../utils/Utils';
import { LogActionTableFilter } from '../filters/log-action-filter';
import { LogLevelTableFilter } from '../filters/log-level-filter';
import { LogSourceTableFilter } from '../filters/log-source-filter';
import { LogLevelFormatterComponent } from '../formatters/log-level-formatter.component';

@Injectable()
export class LogsListTableDataSource extends TableDataSource<Log> {
  private exportAction = new TableExportLogsAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private router: Router,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    // Server Actions
    const actions = this.windowService.getUrlParameterValue('actions');
    if (actions) {
      const logActionTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'action');
      if (logActionTableFilter) {
        for (const action of actions.split('|')) {
          logActionTableFilter.currentValue.push({
            key: action,
            value: action,
          });
        }
        this.filterChanged(logActionTableFilter);
      }
    }
    // Charging Station
    const chargingStationID = this.windowService.getUrlParameterValue('ChargingStationID');
    if (chargingStationID) {
      const logSourceTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'charger');
      if (logSourceTableFilter) {
        logSourceTableFilter.currentValue = [{ key: chargingStationID, value: chargingStationID }];
        this.filterChanged(logSourceTableFilter);
      }
    }
    // Log Level
    const logLevel = this.windowService.getUrlParameterValue('LogLevel');
    if (logLevel) {
      const logLevelTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'level');
      if (logLevelTableFilter) {
        logLevelTableFilter.currentValue = [
          logLevels.find((logLevelObject) => logLevelObject.key === logLevel),
        ];
        this.filterChanged(logLevelTableFilter);
      }
    }
    // StartDateTime and EndDateTime
    const startDateTime = this.windowService.getUrlParameterValue('StartDateTime');
    const endDateTime = this.windowService.getUrlParameterValue('EndDateTime');
    if (startDateTime) {
      const startDateTimeValue = moment(startDateTime);
      let endDateTimeValue = moment(startDateTime).endOf('day');
      if (endDateTime) {
        endDateTimeValue = moment(endDateTime);
      }
      const dateRangeFilter = this.tableFiltersDef.find((filter) => filter.id === 'dateRange');
      if (dateRangeFilter) {
        dateRangeFilter.currentValue.startDate = startDateTimeValue;
        dateRangeFilter.currentValue.endDate = endDateTimeValue;
        this.filterChanged(dateRangeFilter);
        const timestampColumn = this.tableColumnsDef.find((column) => column.id === 'timestamp');
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

  public loadDataImpl(): Observable<DataResult<Log>> {
    return new Observable((observer) => {
      this.centralServerService
        .getLogs(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (logs) => {
            this.exportAction.visible = logs.canExport;
            // Add the users in the message
            for (const log of logs.result) {
              let user;
              // Set User
              if (log.user) {
                user = Utils.buildUserFullName(log.user);
              }
              // Set Action On User
              if (log.actionOnUser) {
                user = user
                  ? `${user} > ${Utils.buildUserFullName(log.actionOnUser)}`
                  : Utils.buildUserFullName(log.actionOnUser);
              }
              // Set
              if (user) {
                log.message = `${user} > ${log.message}`;
              }
            }
            observer.next(logs);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public getRowDetails(row: Log): Observable<string> {
    // Read the log details
    return this.centralServerService
      .getLog(row.id)
      .pipe(map((log) => Formatters.formatTextToHTML(log.detailedMessages)));
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
        name: 'logs.date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: true,
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn, 'medium'),
      },
      {
        id: 'source',
        name: 'logs.source',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
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
        id: 'chargingStationID',
        name: 'chargers.title',
        headerClass: 'col-15p',
        sortable: true,
        class: 'text-center col-15p',
        formatter: (chargingStationID: string) => chargingStationID ?? '-',
      },
      {
        id: 'message',
        name: 'logs.message',
        headerClass: 'col-50p',
        class: 'text-left col-50p',
        sortable: true,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.exportAction, ...tableActionsDef];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case LogButtonAction.EXPORT_LOGS:
        if (actionDef.action) {
          (actionDef as TableExportLogsActionDef).action(
            this.buildFilterValues(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
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
    const issuerFilter = new IssuerFilter().getFilterDef();
    if (this.authorizationService.isSuperAdmin()) {
      return [
        new DateRangeTableFilter({
          translateService: this.translateService,
          showSeconds: true,
          start: moment().startOf('day'),
          end: moment().endOf('day'),
        }).getFilterDef(),
        new LogLevelTableFilter().getFilterDef(),
        new LogSourceTableFilter().getFilterDef(),
        new LogActionTableFilter().getFilterDef(),
        new UserTableFilter([issuerFilter]).getFilterDef(),
      ];
    } else {
      const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
      if (!this.componentService.isActive(TenantComponents.ORGANIZATION)) {
        siteFilter.visible = false;
      }
      return [
        new DateRangeTableFilter({
          translateService: this.translateService,
          showSeconds: true,
          start: moment().startOf('day'),
          end: moment().endOf('day'),
        }).getFilterDef(),
        new LogLevelTableFilter().getFilterDef(),
        new LogSourceTableFilter().getFilterDef(),
        new LogActionTableFilter().getFilterDef(),
        siteFilter,
        new ChargingStationTableFilter([siteFilter]).getFilterDef(),
        new UserTableFilter([issuerFilter]).getFilterDef(),
      ];
    }
  }
}
