import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {UsersDataSource} from './users-data-source-table';
import {UsersInErrorDataSource} from './users-in-error-data-source-table';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html'
})
export class UsersComponent extends AbstractTabComponent implements OnInit {
  public isAdmin;

  constructor(
    public usersDataSource: UsersDataSource,
    public usersInErrorDataSource: UsersInErrorDataSource,
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService) {
    super(activatedRoute, windowService, ['all', 'inerror']);

    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
