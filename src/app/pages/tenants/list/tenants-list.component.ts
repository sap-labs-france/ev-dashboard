import { Component } from '@angular/core';
import { TenantsListTableDataSource } from './tenants-list-table-data-source';

@Component({
  selector: 'app-tenants-cmp',
  templateUrl: 'tenants-list.component.html',
  providers: [TenantsListTableDataSource]
})
export class TenantsListComponent {
  constructor(
    public tenantsListTableDataSource: TenantsListTableDataSource) {
  }
}
