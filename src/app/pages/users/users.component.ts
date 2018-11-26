import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {UsersDataSource} from './users-data-source-table';

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html'
})
export class UsersComponent implements OnInit {
  public isAdmin;

  constructor(
    private usersDataSource: UsersDataSource,
    private authorizationService: AuthorizationService) {

    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
