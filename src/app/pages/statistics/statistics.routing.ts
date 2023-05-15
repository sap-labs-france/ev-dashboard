import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TenantComponents } from '../../types/Tenant';
import { StatisticsComponent } from './statistics.component';

export const StatisticsRoutes: Routes = [
  {
    path: '',
    component: StatisticsComponent,
    canActivate: [RouteGuardService],
    data: {
      component: TenantComponents.STATISTICS,
      auth: {
        entity: Entity.TRANSACTION,
        action: Action.LIST,
      },
    },
  },
];
