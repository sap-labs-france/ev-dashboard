import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {AuthorizationService} from '../services/authorization-service';
import {CentralServerService} from '../services/central-server.service';

@Injectable()
export class TenantGuard implements CanActivate, CanActivateChild {
  private static readonly NOT_FOUND_ROUTE = 'not-found';
  private static readonly STATUS_VALID = 'valid';
  private static readonly STATUS_INVALID = 'invalid';
  private status;

  constructor(
    private router: Router,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check the Tenant
    if (!this.status) {
      this.centralServerService.verifyTenant().subscribe(() => {
        this.status = TenantGuard.STATUS_VALID;

        if (state.url.includes(TenantGuard.NOT_FOUND_ROUTE)) {
          this.router.navigateByUrl('');
        } else {
          this.router.navigateByUrl(state.url);
        }
      }, (error) => {
        this.status = TenantGuard.STATUS_INVALID;
        // Redirect to the not found page
        this.router.navigate([TenantGuard.NOT_FOUND_ROUTE]);
      });
    }

    if (this.status === TenantGuard.STATUS_VALID) {
      return true;
    }
    return state.url.includes(TenantGuard.NOT_FOUND_ROUTE);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
