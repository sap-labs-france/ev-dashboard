import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Route, Router, RouterStateSnapshot, CanLoad, UrlSegment} from '@angular/router';
import {CentralServerService} from './central-server.service';
import {AuthorizationService} from './authorization-service';
import {MessageService} from './message.service';
import {TranslateService} from '@ngx-translate/core';
import {WindowService} from './window.service';
import {ComponentService} from './component.service';
import { environment } from 'environments/environment';
@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private windowService: WindowService) {
  }

  public canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean {
    const queryParams = {};

    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      if (this.isRouteAllowed(activatedRoute.routeConfig)) {
        return true;
      }
      this.router.navigate(['/']);
      return false;
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
        // login successful so redirect to return url
        this.router.navigate(['/']);
      }, (error) => {
        // Report the error
        this.messageService.showErrorMessage(
          this.translateService.instant('authentication.wrong_email_or_password'));
        // Naigate to login
        this.router.navigate(['/auth/login'], {queryParams: {'email': email}});
      });
    } else {
      // Not logged in so redirect to login page with the return url
      this.router.navigate(['/auth/login'], {queryParams});
    }
    return false;
  }

  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }

  public isRouteAllowed(route: Route): boolean {
    const auth = route.data ? route.data['auth'] : undefined;
    if (auth) {
      return this.authorizationService.canAccess(auth.entity, auth.action);
    }

    const component = route.data ? route.data['component'] : undefined;
    if (component && !this.componentService.isActive(component)) {
      return false;
    }

    let isAuthorized = false;
    const forAdminOnly = route.data ? route.data['forAdminOnly'] : false;
    const forSuperAdminOnly = route.data ? route.data['forSuperAdminOnly'] : false;

    if (this.authorizationService.isSuperAdmin()) {
      if (forSuperAdminOnly || !forAdminOnly) {
        isAuthorized = true;
      }
    } else if (this.authorizationService.isAdmin()) {
      if (forAdminOnly || !forSuperAdminOnly) {
        isAuthorized = true;
      }
    } else if (!forSuperAdminOnly && !forAdminOnly) {
      isAuthorized = true;
    }

    return isAuthorized;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    if (route.data && route.data.options && route.data.options.onlyDev) {
      console.log('Environment ' + environment.production);
      return !environment.production; // if prod = false it will load module
    } else {
      return true;
    }
  }
}
