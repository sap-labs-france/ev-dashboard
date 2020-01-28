import { Routes } from '@angular/router';

import { Actions, Entities } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.CHARGING_STATIONS,
        action: Actions.LIST,
      },
    },
  },
];
