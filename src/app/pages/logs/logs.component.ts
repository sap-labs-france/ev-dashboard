import { Component } from '@angular/core';
import { LogsDataSource } from './logs-data-source-table';

@Component({
  selector: 'app-logs-cmp',
  templateUrl: 'logs.component.html',
  providers: [LogsDataSource]
})
export class LogsComponent {
  constructor(
    public logsDataSource: LogsDataSource) {
  }
}
