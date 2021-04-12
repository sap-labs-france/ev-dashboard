import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public usersInErrorDataSource: UsersInErrorTableDataSource,
    private dialog: MatDialog,
    private windowService: WindowService) {}

  public ngOnInit(): void {
    // Check if User ID id provided
    const userID = this.windowService.getSearch('UserID');
    if (userID) {
      const editAction = new TableEditUserAction().getActionDef();
      if (editAction.action) {
        editAction.action(UserDialogComponent, this.dialog, { id: userID });
      }
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
