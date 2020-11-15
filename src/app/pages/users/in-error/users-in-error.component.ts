import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TableEditUserAction } from '../../../shared/table/actions/users/table-edit-user-action';
import { UserDialogComponent } from '../user/user.dialog.component';
import { UsersInErrorTableDataSource } from './users-in-error-table-data-source';

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
        const editAction = new TableEditUserAction().getActionDef();
        if (editAction.action) {
          editAction.action(UserDialogComponent, user, this.dialog);
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
