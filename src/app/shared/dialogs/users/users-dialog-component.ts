import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UsersDataSource } from './users-data-source-table';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { KeyValue, User } from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html'
  providers: [
    UsersDataSource
  ]
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    private usersDataSource: UsersDataSource,
    @Inject(MAT_DIALOG_DATA) data) {
    super(data, usersDataSource);
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
