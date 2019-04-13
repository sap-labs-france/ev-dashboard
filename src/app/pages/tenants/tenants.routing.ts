import {Routes} from '@angular/router';

import {TenantsComponent} from './tenants.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {Constants} from '../../utils/Constants';

export const TenantsRoutes: Routes = [
  {
    path: '', component: TenantsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_TENANTS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
