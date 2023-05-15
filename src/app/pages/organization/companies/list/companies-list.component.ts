import { Component } from '@angular/core';

import { CompanyComponent } from '../company/company.component';
import { CompaniesListTableDataSource } from './companies-list-table-data-source';

@Component({
  selector: 'app-companies-list',
  template: '<app-table [dataSource]="companiesListTableDataSource"></app-table>',
  providers: [CompaniesListTableDataSource, CompanyComponent],
})
export class CompaniesListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public companiesListTableDataSource: CompaniesListTableDataSource) {}
}
