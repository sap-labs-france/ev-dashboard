import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {UsersDataSource} from './users-data-source-table';
import {UsersInErrorDataSource} from './users-in-error-data-source-table';

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html'
})
export class UsersComponent implements OnInit {
  public isAdmin;

  constructor(
    public usersDataSource: UsersDataSource,
    public usersInErrorDataSource: UsersInErrorDataSource,
    private authorizationService: AuthorizationService) {

    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
