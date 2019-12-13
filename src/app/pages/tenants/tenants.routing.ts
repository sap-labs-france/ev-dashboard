import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { TenantsListComponent } from './list/tenants-list.component';

export const TenantsRoutes: Routes = [
  {
    path: '', component: TenantsListComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_TENANTS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
