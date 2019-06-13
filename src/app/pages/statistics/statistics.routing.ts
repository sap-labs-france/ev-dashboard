import { Routes } from '@angular/router';

import { StatisticsComponent } from './statistics.component';
import { RouteGuardService } from '../../services/route-guard.service';
import { ComponentEnum } from '../../services/component.service';
import { Constants } from '../../utils/Constants';

export const StatisticsRoutes: Routes = [
  {
    path: '', component: StatisticsComponent, canActivate: [RouteGuardService], data: {
      component: ComponentEnum.STATISTICS,
      auth: {
        entity: Constants.ENTITY_TRANSACTIONS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
