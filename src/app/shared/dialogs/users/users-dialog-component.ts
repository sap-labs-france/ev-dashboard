import { Component, Inject, Self } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersDataSource } from './users-data-source-table';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { KeyValue, User } from '../../../common.types';

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
      this.title = 'users.select_users'
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
