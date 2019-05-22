import {Routes} from '@angular/router';

import {StatisticsComponent} from './statistics.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {Constants} from '../../utils/Constants';

export const StatisticsRoutes: Routes = [
  {
    path: '', component: StatisticsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_TRANSACTIONS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
