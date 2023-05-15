import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { ChargingStationTemplatesComponent } from './charging-station-templates.component';

export const ChargingStationTemplatesRoutes: Routes = [
  {
    path: '',
    component: ChargingStationTemplatesComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.CHARGING_STATION_TEMPLATE,
        action: Action.LIST,
      },
    },
  },
];
