import {debounceTime} from 'rxjs/operators';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CentralServerService} from '../services/central-server.service';
import {CentralServerNotificationService} from '../services/central-server-notification.service';
import {AuthorizationService} from '../services/authorization-service';
import {ConfigService} from '../services/config.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Constants} from '../utils/Constants';
import {RouteGuardService} from '../services/route-guard.service';


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
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;
  public menuItems: any[];
  public loggedUser;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  private userSubscription;
  public isAdmin = false;
  public canEditProfile = false;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private guard: RouteGuardService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService) {
    this.toggleSidebar();
    // Get the routes
    this.menuItems = this.activatedRoute.routeConfig.children.filter(route => {
      return route.data && route.data.menu && this.guard.isRouteAllowed(route);
    }).map(route => route.data.menu);

    // Set admin
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    // Get the logged user
    this.loggedUser = this.centralServerService.getLoggedUser();

    if (authorizationService.canUpdateUser({'id': this.loggedUser.id})) {
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
    this.centralServerService.getUserImage(this.loggedUser.id).subscribe((image) => {
      // Keep
      this.loggedUserImage = (image && image.image ? image.image : Constants.USER_NO_PICTURE).toString();
    });
  }

  isMobileMenu() {
    // if ($(window).width() > 991) {
    //   return false;
    // }
    // return true;
    return false;
  };

  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
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
