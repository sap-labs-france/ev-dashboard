import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATIONS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
