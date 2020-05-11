import { Action, Entity } from 'app/types/Authorization';

import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationsComponent } from './charging-stations.component';
import { RouteGuardService } from '../../guard/route-guard';
import { Routes } from '@angular/router';

export const ChargingStationsRoutes: Routes = [
  {
    path: ':id', component: ChargingStationDialogComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATION,
        action: Action.READ,
      },
    },
  },
  {
    path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATIONS,
        action: Action.LIST,
      },
    },
  },
];
