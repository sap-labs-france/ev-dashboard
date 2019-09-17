import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue, User } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { UsersDialogTableDataSource } from './users-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html'
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  constructor(
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    private usersListTableDataSource: UsersDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data) {
    super(data, dialogRef, usersListTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'users.select_users';
    }
    this.usersListTableDataSource.destroyDatasource();
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
