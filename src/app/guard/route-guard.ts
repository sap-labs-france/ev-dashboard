import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Role } from 'app/types/Authorization';
import { environment } from 'environments/environment';
import { AuthorizationService } from '../services/authorization.service';
import { CentralServerService } from '../services/central-server.service';
import { ComponentService } from '../services/component.service';
import { MessageService } from '../services/message.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild, CanLoad {

  static readonly LOGIN_ROUTE = '/auth/login';
  static readonly TENANT_ROUTE = '/tenants';
  static readonly CHARGING_STATION_ROUTE = '/charging-stations';
  static readonly BROWSER_NOT_SUPPORTED_ROUTE = '/browser-not-supported';

  private userRole?: string;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService) {

    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      if (user) {
        this.userRole = user.role;
      } else {
        this.userRole = undefined;
      }
    });
  }

  public canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean {
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    const isActiveInSuperTenant = activatedRoute && activatedRoute.data ? activatedRoute.data['activeInSuperTenant'] : undefined;

    if (isIEOrEdge) {
      this.redirectToBrowserNotSupportRoute();
      return false;
    }
    const queryParams = {};
    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      if (this.isRouteAllowed(activatedRoute.routeConfig, isActiveInSuperTenant)) {
        return true;
      }
      this.redirectToDefaultRoute();
      return false;
    } else {
      this.userRole = undefined;
    }
    // Add URL origin
    // @ts-ignore
    queryParams['returnUrl'] = routerState.url;
    // Check user/pass in URL
    const email = activatedRoute.queryParams['email'];
    const password = activatedRoute.queryParams['password'];
    if (email && password) {
      // Login
      this.centralServerService.login({
        email,
        password,
        acceptEula: true,
      }).subscribe((result) => {
        // Success
        this.centralServerService.loginSucceeded(result.token);
        this.redirectToDefaultRoute();
      }, (error) => {
        // Report the error
        this.messageService.showErrorMessage(
          this.translateService.instant('authentication.wrong_email_or_password'));
        // Navigate to login
        this.router.navigate([RouteGuardService.LOGIN_ROUTE], {queryParams: {email}});
      });
    } else {
      // Not logged in so redirect to login page with the return url
      this.router.navigate([RouteGuardService.LOGIN_ROUTE], {queryParams});
    }
    return false;
  }

  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }

  public isRouteAllowed(route: Route | null, isActiveInSuperTenant?: boolean): boolean {
    const auth = route && route.data ? route.data['auth'] : undefined;
    const displayInSuperTenant = route && route.data ? route.data['displayInSuperTenant'] : undefined;
    if (displayInSuperTenant && this.authorizationService.isSuperAdmin()) {
      return displayInSuperTenant
    }
    if (auth) {
      const component = route && route.data ? route.data['component'] : undefined;
      if (component && !this.componentService.isActive(component)) {
        if (this.authorizationService.isSuperAdmin() && isActiveInSuperTenant) {
          return true;
        }
        return false;
      }
      return this.authorizationService.canAccess(auth.entity, auth.action);
    }
    return false;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    if (route.data && route.data.options && route.data.options.onlyDev) {
      return !environment.production; // if prod = false it will load module
    }
    return true;
  }

  async redirectToDefaultRoute(): Promise<boolean> {
    let route = RouteGuardService.LOGIN_ROUTE;
    if (this.userRole) {
      switch (this.userRole) {
        case Role.SUPER_ADMIN:
          route = RouteGuardService.TENANT_ROUTE;
          break;
        case Role.ADMIN:
        case Role.BASIC:
        case Role.DEMO:
        default:
          route = RouteGuardService.CHARGING_STATION_ROUTE;
      }
    }
    return this.router.navigate([route]);
  }

  async redirectToBrowserNotSupportRoute(): Promise<boolean> {
    return this.router.navigate([RouteGuardService.BROWSER_NOT_SUPPORTED_ROUTE]);
  }
}
