import { Component, OnInit } from '@angular/core';

import { CentralServerService } from 'app/services/central-server.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/services/message.service';
import { TableEditUserAction } from 'app/shared/table/actions/table-edit-user-action';
import { UsersInErrorTableDataSource } from './users-in-error-table-data-source';
import { WindowService } from 'app/services/window.service';

@Component({
  selector: 'app-users-in-error',
  template: '<app-table [dataSource]="usersInErrorDataSource"></app-table>',
  providers: [UsersInErrorTableDataSource],
})
export class UsersInErrorComponent implements OnInit {
  constructor(
      public usersInErrorDataSource: UsersInErrorTableDataSource,
      private dialog: MatDialog,
      private messageService: MessageService,
      private centralServerService: CentralServerService,
      private windowService: WindowService) {
  }

  public ngOnInit(): void {
    // Check if User ID id provided
    const userId = this.windowService.getSearch('UserID');
    if (userId) {
      this.centralServerService.getUser(userId).subscribe((user) => {
        const editAction = new TableEditUserAction().getActionDef()
        if (editAction.action) {
          editAction.action(user, this.dialog);
        }
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('users.user_id_not_found', {userId});
      });
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
