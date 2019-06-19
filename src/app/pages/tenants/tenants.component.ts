import { Component } from '@angular/core';
import { TenantsDataSource } from './tenants-data-source-table';

@Component({
  selector: 'app-tenants-cmp',
  templateUrl: 'tenants.component.html'
})
export class TenantsComponent {
  constructor(
    public tenantsDataSource: TenantsDataSource) {
  }
}
