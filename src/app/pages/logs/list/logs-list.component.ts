import { Component } from '@angular/core';

import { LogsListTableDataSource } from './logs-list-table-data-source';

@Component({
  selector: 'app-logs-list',
  template: `
    <div class="main-content">
      <app-table [dataSource]="logsListTableDataSource"></app-table>
    </div>
  `,
  providers: [LogsListTableDataSource],
})
export class LogsListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public logsListTableDataSource: LogsListTableDataSource) {}
}
