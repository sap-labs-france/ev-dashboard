import { Routes } from '@angular/router';
import { Action, Entity } from 'app/types/Authorization';

import { RouteGuardService } from '../../guard/route-guard';
import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATIONS,
        action: Action.LIST,
      },
    },
  },
];
