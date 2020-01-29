import { Routes } from '@angular/router';

import { Action, Entity } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
import { ComponentType } from '../../services/component.service';
import { StatisticsComponent } from './statistics.component';

export const StatisticsRoutes: Routes = [
  {
    path: '', component: StatisticsComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.STATISTICS,
      auth: {
        entity: Entity.TRANSACTIONS,
        action: Action.LIST,
      },
    },
  },
];
