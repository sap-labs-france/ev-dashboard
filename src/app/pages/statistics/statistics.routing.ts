import { Routes } from '@angular/router';

import { ComponentType } from '../../services/component.service';
import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { StatisticsComponent } from './statistics.component';

export const StatisticsRoutes: Routes = [
  {
    path: '', component: StatisticsComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.STATISTICS,
      auth: {
        entity: Constants.ENTITY_TRANSACTIONS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
