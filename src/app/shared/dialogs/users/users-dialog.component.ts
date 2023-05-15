import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { UsersDialogTableDataSource } from './users-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  public constructor(
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    private usersListTableDataSource: UsersDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, usersListTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'users.select_users';
    }
    this.usersListTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: User[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: Utils.buildUserFullName(row), objectRef: row });
      });
    }
    return items;
  }
}
