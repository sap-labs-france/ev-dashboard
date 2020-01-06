import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserToken } from 'app/types/User';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RouteGuardService } from '../guard/route-guard';
import { AuthorizationService } from '../services/authorization.service';
import { CentralServerNotificationService } from '../services/central-server-notification.service';
import { CentralServerService } from '../services/central-server.service';
import { ConfigService } from '../services/config.service';
import { Constants } from '../utils/Constants';

declare const $: any;

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0,
};

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  mobileMenuVisible: any = 0;
  public menuItems!: any[];
  public loggedUser: UserToken;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public isAdmin = false;
  public canEditProfile = false;
  private toggleButton: any;
  private sidebarVisible!: boolean;
  private userSubscription!: Subscription;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private guard: RouteGuardService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService) {
    // Get the routes
    if (this.activatedRoute && this.activatedRoute.routeConfig && this.activatedRoute.routeConfig.children) {
      this.menuItems = this.activatedRoute.routeConfig.children.filter((route) => {
        return route.data && route.data.menu && this.guard.isRouteAllowed(route) && this.guard.canLoad(route, []);
      }).map((route) => route && route.data ? route.data.menu : null);
    }

    // Set admin
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    // Get the logged user
    this.loggedUser = this.centralServerService.getLoggedUser();

    if (authorizationService.canUpdateUser()) {
      this.canEditProfile = true;
    }
    // Read user
    this.updateUserImage();
  }

  ngOnInit() {
    // Subscribe to user's change
    this.userSubscription = this.centralServerNotificationService.getSubjectUser().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((notifInfo) => {
      // Update user?
      if (notifInfo['data']['id'] === this.loggedUser.id) {
        // Deleted?
        if (notifInfo.action === Constants.NOTIF_ACTION_DELETE) {
          // Log off user
          this.logout();
        } else {
          // Same user: Update it
          this.updateUserImage();
        }
      }
    });
    this.toggleButton = document.getElementById('toggler');
  }

  ngOnDestroy() {
    // Subscribe to user's change
    this.userSubscription.unsubscribe();
  }

  updateUserImage() {
    // Get the user's image
    if (this.loggedUser && this.loggedUser.id) {
      this.centralServerService.getUserImage(this.loggedUser.id).subscribe((image) => {
        this.loggedUserImage = (image && image.image ? image.image : Constants.USER_NO_PICTURE).toString();
      });
    }
  }

  isMobileMenu() {
    return false;
  }

  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') as HTMLElement;
    }
  }

  isMac(): boolean {
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }

  toggleSidebar() {
    const body = document.getElementsByTagName('body')[0];

    if (misc.sidebar_mini_active === true) {
      body.classList.remove('sidebar-mini');
      misc.sidebar_mini_active = false;
    } else {
      body.classList.add('sidebar-mini');
      misc.sidebar_mini_active = true;
    }
  }

  logout() {
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
}
