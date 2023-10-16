import { Component } from '@angular/core';

import { CarsListTableDataSource } from './cars-list-table-data-source';

@Component({
  selector: 'app-cars-list',
  template: '<app-table [dataSource]="carsListTableDataSource"></app-table>',
  providers: [CarsListTableDataSource],
})
export class CarsListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public carsListTableDataSource: CarsListTableDataSource) {}
}
