import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue, User } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { UsersDataSource } from './users-data-source-table';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  providers: [UsersDataSource]
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  constructor(
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    @Self() private usersDataSource: UsersDataSource,
    @Inject(MAT_DIALOG_DATA) data) {
    super(data, dialogRef, usersDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'users.select_users';
    }
    // Set static filter
    if (data && data.excludeUsersOfSiteID) {
      this.dialogDataSource.setStaticFilters([
        { 'ExcludeSiteID': data.excludeUsersOfSiteID }
      ]);
    }
  }

  getSelectedItems(selectedRows: User[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({ key: row.id, value: `${row.name} ${row.firstName ? row.firstName : ''}`, objectRef: row });
      });
    }
    return items;
  }
}
