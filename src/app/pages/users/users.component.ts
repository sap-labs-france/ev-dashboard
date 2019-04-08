import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {UsersDataSource} from './users-data-source-table';
import {UsersInErrorDataSource} from './users-in-error-data-source-table';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import { CentralServerService } from 'app/services/central-server.service';

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html',
  providers: [
    UsersDataSource,
    UsersInErrorDataSource
  ]
})
export class UsersComponent extends AbstractTabComponent implements OnInit {
  public isAdmin;

  constructor(
    public usersDataSource: UsersDataSource,
    public usersInErrorDataSource: UsersInErrorDataSource,
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    private centralServerService: CentralServerService,
    windowService: WindowService) {
    super(activatedRoute, windowService, ['all', 'inerror']);

    this.isAdmin = this.authorizationService.isAdmin();
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
        this.messageService.showErrorMessage('chargers.charger_id_not_found', {'UserID': userId});
      });
      // Clear Search
      this.windowService.deleteSearch('UserID');
    }
  }    
}
