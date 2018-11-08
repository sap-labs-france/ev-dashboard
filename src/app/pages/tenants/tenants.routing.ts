import {Routes} from '@angular/router';

import {TenantsComponent} from './tenants.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const TenantsRoutes: Routes = [
  {path: '', component: TenantsComponent, canActivate: [RouteGuardService], data: {forSuperAdminOnly: true}}
];
