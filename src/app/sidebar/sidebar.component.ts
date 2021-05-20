import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { version } from '../../../package.json';
import { RouteGuardService } from '../guard/route-guard';
import { AuthorizationService } from '../services/authorization.service';
import { CentralServerNotificationService } from '../services/central-server-notification.service';
import { CentralServerService } from '../services/central-server.service';
import { ConfigService } from '../services/config.service';
import { Action } from '../types/Authorization';
import { UserToken } from '../types/User';
import { Constants } from '../utils/Constants';

declare const $: any;

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  public version: string = version;
  public mobileMenuVisible: any = 0;
  public menuItems!: any[];
  public loggedUser!: UserToken;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public isAdmin = false;
  public canEditProfile = false;
  public logo = Constants.NO_IMAGE;
  public misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
  };
  private userRefreshSubscription!: Subscription;
  private tenantRefreshSubscription!: Subscription;

  public constructor(
    private configService: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private guard: RouteGuardService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService) {
    // Get the routes
    if (this.activatedRoute && this.activatedRoute.routeConfig && this.activatedRoute.routeConfig.children) {
      this.menuItems = this.activatedRoute.routeConfig.children.filter((route) =>
        route.data && route.data.menu && this.guard.isRouteAllowed(route) &&
        this.guard.canLoad(route, [])).map((route) => route && route.data ? route.data.menu : null);
    }
    // Set admin
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    // Get the logged user
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.loggedUser = user;
    });
    if (authorizationService.canUpdateUser()) {
      this.canEditProfile = true;
    }
    // Read user
    this.refreshUser();
    // Read tenant
    this.refreshTenant();
  }

  public ngOnInit() {
    // Listen to changes
    this.createRefresh();
  }

  public ngOnDestroy() {
    this.destroyRefresh();
  }

  public isMobileMenu() {
    return false;
  }

  public updatePS(): void {
    if (window.matchMedia('(min-width: 960px)').matches && !this.isMac()) {
      const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') ;
    }
  }

  public isMac(): boolean {
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }

  public toggleSidebar() {
    const body = document.getElementsByTagName('body')[0];
    if (this.misc.sidebar_mini_active === true) {
      body.classList.remove('sidebar-mini');
      this.misc.sidebar_mini_active = false;
    } else {
      body.classList.add('sidebar-mini');
      this.misc.sidebar_mini_active = true;
    }
  }

  public logout() {
    // Logoff
    this.centralServerService.logout().subscribe(() => {
      // Clear
      this.centralServerService.logoutSucceeded();
      // Redirect to login page with the return url
      this.router.navigate(['/auth/login']);
    }, (error) => {
      // Clear
      this.centralServerService.logoutSucceeded();
      // Redirect to login page with the return url
      this.router.navigate(['/auth/login']);
    });
  }

  private createRefresh() {
    if (this.configService.getCentralSystemServer().socketIOEnabled) {
      // Subscribe to user's change
      this.userRefreshSubscription = this.centralServerNotificationService.getSubjectUser().pipe(debounceTime(
        this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
        // Update user?
        if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.loggedUser.id) {
          // Deleted?
          if (singleChangeNotification.action === Action.DELETE) {
            // Log off user
            this.logout();
          } else {
            // Same user: Update it
            this.refreshUser();
          }
        }
      });
      // Subscribe to tenant's change
      this.tenantRefreshSubscription = this.centralServerNotificationService.getSubjectTenant().pipe(debounceTime(
        this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
        // Update user?
        if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.loggedUser.tenantID) {
          // Deleted?
          if (singleChangeNotification.action === Action.DELETE) {
            // Log off user
            this.logout();
          } else {
            // Same tenant: Update it
            this.refreshTenant();
          }
        }
      });
    }
  }

  private destroyRefresh() {
    if (this.userRefreshSubscription) {
      // Unsubscribe to user's change
      this.userRefreshSubscription.unsubscribe();
    }
    this.userRefreshSubscription = null;
    if (this.tenantRefreshSubscription) {
      // Unsubscribe to user's change
      this.tenantRefreshSubscription.unsubscribe();
    }
    this.tenantRefreshSubscription = null;
  }

  private refreshUser() {
    // Get the user's image
    if (this.loggedUser && this.loggedUser.id) {
      this.centralServerService.getUserImage(this.loggedUser.id).subscribe((userImage) => {
        if (userImage?.image) {
          this.loggedUserImage = userImage.image;
        } else {
          this.loggedUserImage = Constants.USER_NO_PICTURE;
        }
      });
      this.centralServerService.getUser(this.loggedUser.id).subscribe((user) => {
        if (user) {
          this.loggedUser.name = user.name;
          this.loggedUser.firstName = user.firstName;
          this.loggedUser.email = user.email;
        }
      });
    }
  }

  private refreshTenant() {
    // Get Tenant logo
    if (this.loggedUser.tenantID !== 'default') {
      this.centralServerService.getTenantLogo(this.loggedUser.tenantID).subscribe((tenantLogo) => {
        this.logo = tenantLogo ? tenantLogo : Constants.TENANT_DEFAULT_LOGO;
      });
    } else {
      this.logo = Constants.TENANT_DEFAULT_LOGO;
    }
  }
}
