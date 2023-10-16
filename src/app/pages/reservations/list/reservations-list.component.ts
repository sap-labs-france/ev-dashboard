import { Component } from '@angular/core';
import { ReservationsListTableDataSource } from './reservations-list-table-data-source';

@Component({
  selector: 'app-reservations-list',
  template: `<app-table [dataSource]="reservationsListTableDataSource"></app-table>`,
  providers: [ReservationsListTableDataSource],
})
export class ReservationsListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public reservationsListTableDataSource: ReservationsListTableDataSource) {}
}
