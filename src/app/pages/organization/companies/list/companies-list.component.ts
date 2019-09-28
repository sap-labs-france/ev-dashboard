import { Component, OnInit } from '@angular/core';
import { CompaniesListTableDataSource } from './companies-list-table-data-source';

@Component({
  selector: 'app-companies-list',
  template: '<app-table [dataSource]="companiesListTableDataSource"></app-table>',
  providers: [CompaniesListTableDataSource],
})
export class CompaniesListComponent implements OnInit {

  constructor(
    public companiesListTableDataSource: CompaniesListTableDataSource) {
  }

  ngOnInit(): void {
  }
}
