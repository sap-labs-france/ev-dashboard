import {Component, OnInit} from '@angular/core';
import {OrganizationCompaniesDataSource} from './organization-companies-source-table';

@Component({
  selector: 'app-organization-companies',
  template: '<app-table [dataSource]="companiesDataSource"></app-table>',
  providers: [
    OrganizationCompaniesDataSource
  ]
})
export class OrganizationCompaniesComponent implements OnInit {

  constructor(
    public companiesDataSource: OrganizationCompaniesDataSource) {
  }

  ngOnInit(): void {
  }
}
