import {Routes} from '@angular/router';

import {DashboardComponent} from './dashboard.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {Constants} from '../../utils/Constants';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATIONS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
