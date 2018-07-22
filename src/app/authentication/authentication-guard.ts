import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CentralServerService } from '../service/central-server.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private router: Router,
    private centralServerService: CentralServerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const queryParams = {};

    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      // logged in so return true
      return true;
    }

    // Add URL origin
    queryParams['returnUrl'] = state.url;

    // Check user/pass in URL
    const user = route.queryParams['user'];
    const password = route.queryParams['password'];
    if (user && password) {
      // Login
      this.centralServerService.login({
        'email': user,
        'password': password,
        'acceptEula': true
      }).subscribe(result => {
        // Success
        this.centralServerService.loggingSucceeded(result.token);
        // login successful so redirect to return url
        this.router.navigate(['/']);
      });
    } else {
      // Not logged in so redirect to login page with the return url
      this.router.navigate(['/authentication/login'], { queryParams });
    }
    return false;
  }
}
