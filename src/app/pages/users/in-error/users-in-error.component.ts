import { Component, OnInit } from '@angular/core';
import { UsersInErrorTableDataSource } from './users-in-error-table-data-source';
import { MessageService } from 'app/services/message.service';
import { CentralServerService } from 'app/services/central-server.service';
import { WindowService } from 'app/services/window.service';

@Component({
  selector: 'app-users-in-error',
  templateUrl: 'users-in-error.component.html',
  providers: [UsersInErrorTableDataSource]
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
      this.centralServerService.getUser(userId).subscribe(user => {
        // Found
        this.usersInErrorDataSource.showUserDialog(user);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('users.user_id_not_found', {'userId': userId});
      });
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
