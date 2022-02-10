import { Routes } from '@angular/router';
import { RouteGuardService } from 'guard/route-guard';
import { Action, Entity } from 'types/Authorization';
import { TenantComponents } from 'types/Tenant';

import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.ORGANIZATION,
      auth: [
        {
          entity: Entity.SITE_AREA,
          action: Action.LIST
        },
      ],
    },
  },
];
