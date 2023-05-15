import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TenantsListComponent } from './list/tenants-list.component';

export const TenantsRoutes: Routes = [
  {
    path: '',
    component: TenantsListComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.TENANT,
        action: Action.LIST,
      },
    },
  },
];
