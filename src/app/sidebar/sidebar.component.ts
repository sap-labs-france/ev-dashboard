import {Component, OnDestroy, OnInit} from '@angular/core';
import {CentralServerService} from '../services/central-server.service';
import {CentralServerNotificationService} from '../services/central-server-notification.service';
import {AuthorizationService} from '../services/authorization-service';
import {ConfigService} from '../services/config.service';
import {Router} from '@angular/router';
import {Constants} from '../utils/Constants';
import 'rxjs/add/operator/debounceTime';

declare const $: any;

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  public menuItems: any[];
  public loggedUser;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  private userSubscription;
  public isAdmin = false;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService) {
    // Get the routes
    this.centralServerService.getRoutes().subscribe((routes) => {
      // Set
      this.menuItems = routes.filter(menuItem => menuItem);
    });
    // Set admin
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    // Get the logged user
    this.loggedUser = this.centralServerService.getLoggedUser();
    // Read user
    this.updateUserImage();
  }

  ngOnInit() {
    // Subscribe to user's change
    this.userSubscription = this.centralServerNotificationService.getSubjectUser().debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis).subscribe((notifInfo) => {
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
    if ($(window).width() > 991) {
      return false;
    }
    return true;
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
