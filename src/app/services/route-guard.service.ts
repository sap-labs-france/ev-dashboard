import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Constants } from '../utils/Constants';
import { AuthorizationService } from './authorization.service';
import { CentralServerService } from './central-server.service';
import { ComponentService } from './component.service';
import { MessageService } from './message.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild, CanLoad {

  static readonly LOGIN_ROUTE = '/auth/login';
  static readonly TENANT_ROUTE = '/tenants';
  static readonly CHARGING_STATION_ROUTE = '/charging-stations';

  private userRole?: string;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService) {

    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      if (user) {
        this.userRole = user.role;
      } else {
        this.userRole = undefined;
      }
    });
  }

  public canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean {
    const queryParams = {};

    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      if (this.isRouteAllowed(activatedRoute.routeConfig)) {
        return true;
      }
      this.redirectToDefaultRoute();
      return false;
    } else {
      this.userRole = undefined;
    }

    // Add URL origin
    queryParams['returnUrl'] = routerState.url;

    // Check user/pass in URL
    const email = activatedRoute.queryParams['email'];
    const password = activatedRoute.queryParams['password'];
    if (email && password) {
      // Login
      this.centralServerService.login({
        'email': email,
        'password': password,
        'acceptEula': true
      }).subscribe((result) => {
        // Success
        this.centralServerService.loggingSucceeded(result.token);
        this.redirectToDefaultRoute();
      }, (error) => {
        // Report the error
        this.messageService.showErrorMessage(
          this.translateService.instant('authentication.wrong_email_or_password'));
        // Naigate to login
        this.router.navigate([RouteGuardService.LOGIN_ROUTE], {queryParams: {'email': email}});
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

  public isRouteAllowed(route: Route): boolean {
    const auth = route.data ? route.data['auth'] : undefined;
    if (auth) {
      const component = route.data ? route.data['component'] : undefined;
      if (component && !this.componentService.isActive(component)) {
        return false;
      }

      return this.authorizationService.canAccess(auth.entity, auth.action);
    }

    return false;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    if (route.data && route.data.options && route.data.options.onlyDev) {
      return !environment.production; // if prod = false it will load module
    } else {
      return true;
    }
  }

  redirectToDefaultRoute(): Promise<boolean> {
    let route = RouteGuardService.LOGIN_ROUTE;
    if (this.userRole) {
      switch (this.userRole) {
        case Constants.ROLE_SUPER_ADMIN:
          route = RouteGuardService.TENANT_ROUTE;
          break;
        case Constants.ROLE_ADMIN:
        case Constants.ROLE_BASIC:
        case Constants.ROLE_DEMO:
        default:
          route = RouteGuardService.CHARGING_STATION_ROUTE;
      }
    }
    return this.router.navigate([route]);
  }
}
