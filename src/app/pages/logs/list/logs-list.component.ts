import { Component } from '@angular/core';
import { LogsListTableDataSource } from './logs-list-table-data-source';

@Component({
  selector: 'app-logs-list',
  templateUrl: 'logs-list.component.html',
  providers: [LogsListTableDataSource]
})
export class LogsListComponent {
  constructor(
    public logsListTableDataSource: LogsListTableDataSource) {
  }
}
