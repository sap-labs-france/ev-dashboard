import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UsersDataSource } from './users-data-source-table';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { User, KeyValue } from '../../../common.types';
import { Constants } from '../../../utils/Constants';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  styleUrls: ['../dialogs.component.scss'],
})
export class UsersDialogComponent extends DialogTableDataComponent<User> {
  protected title = 'users.select_users';
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<UsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    super(data);

    // Create table data source
    this.dialogDataSource = new UsersDataSource(
      this.messageService,
      this.translateService,
      this.router,
      this.centralServerService);
  }

  getSelectedItems(selectedRows: User[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(user => {
        items.push({ key: user.id, value: `${user.name} ${user.firstName ? user.firstName : ''}` });
      });
    }
    return items;
  }
}
