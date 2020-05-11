import { Component } from '@angular/core';

import { CarCatalogsListTableDataSource } from './car-catalogs-list-table-data-source';

@Component({
  selector: 'app-car-catalogs-list',
  template: '<app-table [dataSource]="carCatalogsListTableDataSource"></app-table>',
  providers: [CarCatalogsListTableDataSource],
})
export class CarCatalogsListComponent {

  constructor(
    public carCatalogsListTableDataSource: CarCatalogsListTableDataSource,
  ) {
  }
}
