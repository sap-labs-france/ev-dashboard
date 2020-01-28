import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Actions, Entities } from '../../types/Authorization';
import { TenantsListComponent } from './list/tenants-list.component';

export const TenantsRoutes: Routes = [
  {
    path: '', component: TenantsListComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.TENANTS,
        action: Actions.LIST,
      },
    },
  },
];
