import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { UsersDialogTableDataSource } from './users-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  constructor(
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    private usersListTableDataSource: UsersDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, usersListTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'users.select_users';
    }
    this.usersListTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: User[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: Utils.buildUserFullName(row), objectRef: row });
      });
    }
    return items;
  }
}
