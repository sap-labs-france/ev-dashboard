import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { version } from '../../../package.json';
import { RouteGuardService } from '../guard/route-guard';
import { AuthorizationService } from '../services/authorization.service';
import { CentralServerService } from '../services/central-server.service';
import { UserToken } from '../types/User';
import { Constants } from '../utils/Constants';

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent {
  public version: string = version;
  public mobileMenuVisible: any = 0;
  public menuItems!: any[];
  public loggedUser!: UserToken;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public isAdmin = false;
  public canEditProfile = false;
  public logo = Constants.NO_IMAGE;
  public sidebarMinimized: boolean;

  public constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private guard: RouteGuardService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    @Inject(DOCUMENT) private document: Document) {
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
    this.loadUser();
    // Read tenant
    this.loadTenant();
  }

  public toggleSidebar() {
    const body = this.document.getElementsByTagName('body')[0];
    if (this.sidebarMinimized === true) {
      body.classList.remove('sidebar-mini');
      this.sidebarMinimized = false;
    } else {
      body.classList.add('sidebar-mini');
      this.sidebarMinimized = true;
    }
  }

  public logout() {
    // Logoff
    this.centralServerService.logout().subscribe(() => {
      // Clear
      this.centralServerService.clearLoginInformation();
      // Redirect to login page with the return url
      void this.router.navigate(['/auth/login']);
    }, (error) => {
      // Clear
      this.centralServerService.clearLoginInformation();
      // Redirect to login page with the return url
      void this.router.navigate(['/auth/login']);
    });
  }

  private loadUser() {
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

  private loadTenant() {
    // Get Tenant logo
    if (this.loggedUser.tenantID !== 'default') {
      this.centralServerService.getTenantLogo(this.loggedUser.tenantID).subscribe((tenantLogo) => {
        this.logo = tenantLogo ? tenantLogo : Constants.NO_IMAGE;
      });
    } else {
      this.logo = Constants.NO_IMAGE;
    }
  }
}
