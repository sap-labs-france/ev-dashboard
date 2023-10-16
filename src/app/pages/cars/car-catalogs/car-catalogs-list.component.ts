import { Component } from '@angular/core';

import { CarCatalogsListTableDataSource } from './car-catalogs-list-table-data-source';

@Component({
  selector: 'app-car-catalogs-list',
  template: '<app-table [dataSource]="carCatalogsListTableDataSource"></app-table>',
  providers: [CarCatalogsListTableDataSource],
})
export class CarCatalogsListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public carCatalogsListTableDataSource: CarCatalogsListTableDataSource) {}
}
