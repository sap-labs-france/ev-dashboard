import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { AuthorizationService } from '../../services/authorization-service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/tab/AbstractTab.component';
import { UsersDataSource } from './users-data-source-table';
import { UsersInErrorDataSource } from './users-in-error-data-source-table';

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html',
})
export class UsersComponent extends AbstractTabComponent implements OnInit {
  public isAdmin;

  constructor(
    public usersDataSource: UsersDataSource,
    public usersInErrorDataSource: UsersInErrorDataSource,
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    windowService: WindowService) {
    super(activatedRoute, windowService, ['all', 'inerror']);

    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit(): void {
    // Check if User ID id provided
    const userId = this.windowService.getSearch('UserID');
    if (userId) {
      // Route to the correct datasource relative to the page fragment (Hash)
      switch (this.windowService.getHash()) {
        case 'all':
          this.centralServerService.getUser(userId).subscribe(user => {
            // Found
            this.usersDataSource.showUserDialog(user);
          }, (error) => {
            // Not Found
            this.messageService.showErrorMessage('users.user_id_not_found', {'userId': userId});
          });
          break;
        case 'inerror':
          this.centralServerService.getUser(userId).subscribe(user => {
            // Found
            this.usersInErrorDataSource.showUserDialog(user);
          }, (error) => {
            // Not Found
            this.messageService.showErrorMessage('users.user_id_not_found', {'userId': userId});
          });
          break;
        default:
          this.messageService.showErrorMessage('users.user_id_not_found', {'userId': userId});
          break;
      }
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }
}
