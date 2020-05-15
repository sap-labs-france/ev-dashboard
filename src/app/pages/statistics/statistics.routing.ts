import { Routes } from '@angular/router';
import { Action, Entity } from 'app/types/Authorization';
import TenantComponents from 'app/types/TenantComponents';

import { RouteGuardService } from '../../guard/route-guard';
import { StatisticsComponent } from './statistics.component';

export const StatisticsRoutes: Routes = [
  {
    path: '', component: StatisticsComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.STATISTICS,
      auth: {
        entity: Entity.TRANSACTIONS,
        action: Action.LIST,
      },
    },
  },
];
