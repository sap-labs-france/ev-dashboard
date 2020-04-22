import { Component } from '@angular/core';
import { CompanyDialogComponent } from '../company/company.dialog.component';
import { CompaniesListTableDataSource } from './companies-list-table-data-source';

@Component({
  selector: 'app-companies-list',
  template: '<app-table [dataSource]="companiesListTableDataSource"></app-table>',
  providers: [CompaniesListTableDataSource, CompanyDialogComponent],
})
export class CompaniesListComponent {

  constructor(
    public companiesListTableDataSource: CompaniesListTableDataSource) {
  }
}
