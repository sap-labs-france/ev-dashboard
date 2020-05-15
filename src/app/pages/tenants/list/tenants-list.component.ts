import { Component } from '@angular/core';

import { TenantsListTableDataSource } from './tenants-list-table-data-source';

@Component({
  selector: 'app-tenants-cmp',
  template: `
    <div class="main-content">
      <app-table [dataSource]="tenantsListTableDataSource"></app-table>
    </div>
  `,
  providers: [TenantsListTableDataSource],
})
export class TenantsListComponent {
  constructor(
    public tenantsListTableDataSource: TenantsListTableDataSource) {
  }
}
