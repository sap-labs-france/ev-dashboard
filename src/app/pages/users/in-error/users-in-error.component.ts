import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { WindowService } from 'app/services/window.service';
import { UsersInErrorTableDataSource } from './users-in-error-table-data-source';

@Component({
  selector: 'app-users-in-error',
  template: '<app-table [dataSource]="usersInErrorDataSource"></app-table>',
  providers: [UsersInErrorTableDataSource],
})
export class UsersInErrorComponent implements OnInit {
  constructor(
      public usersInErrorDataSource: UsersInErrorTableDataSource,
      private messageService: MessageService,
      private centralServerService: CentralServerService,
      private windowService: WindowService) {
  }

  ngOnInit(): void {
    // Check if User ID id provided
    const userId = this.windowService.getSearch('UserID');
    if (userId) {
      this.centralServerService.getUser(userId).subscribe((user) => {
        // Found
        this.usersInErrorDataSource.showUserDialog(user);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('users.user_id_not_found', {userId});
      });
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
