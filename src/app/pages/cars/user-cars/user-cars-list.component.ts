import { Component } from '@angular/core';
import { UserCarsListTableDataSource } from './user-cars-list-table-data-source';

@Component({
  selector: 'app-user-cars-list',
  template: '<app-table [dataSource]="userCarsListTableDataSource"></app-table>',
  providers: [UserCarsListTableDataSource],
})
export class UserCarsListComponent {

  constructor(
    public userCarsListTableDataSource: UserCarsListTableDataSource,
  ) {
  }
}
