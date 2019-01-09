import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Route, Router, RouterStateSnapshot} from '@angular/router';
import {CentralServerService} from './central-server.service';
import {AuthorizationService} from './authorization-service';
import {MessageService} from './message.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService) {
  }

  public canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean {
    const queryParams = {};

    if (activatedRoute.fragment) {
      this.router.navigateByUrl(activatedRoute.fragment);
      return false;
    }

    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      return this.isRouteAllowed(activatedRoute.routeConfig);
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
}
