import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { AuthorizationService } from '../../../services/authorization-service';
import { WindowService } from '../../../services/window.service';
import { UsersListTableDataSource } from './users-list-table-data-source';

@Component({
  selector: 'app-users-list',
  templateUrl: 'users-list.component.html',
  providers: [UsersListTableDataSource]
})
export class UsersListComponent implements OnInit {
  public isAdmin: boolean;

  constructor(
    public usersListTableDataSource: UsersListTableDataSource,
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private windowService: WindowService) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit(): void {
    // Check if User ID id provided
    const userId = this.windowService.getSearch('UserID');
    if (userId) {
      this.centralServerService.getUser(userId).subscribe(user => {
        // Found
        this.usersListTableDataSource.showUserDialog(user);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('users.user_id_not_found', {'userId': userId});
      });
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
