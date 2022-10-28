import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationsMapComponent } from './charging-stations-map/charging-stations-map.component';
import { ChargingStationsComponent } from './charging-stations.component';

export const ChargingStationsRoutes: Routes = [
  {
    path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATION,
        action: Action.LIST,
      },
    },
  },
  {
    path: ':id', component: ChargingStationDialogComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATION,
        action: Action.READ,
      },
    },
  },
  {
    path: 'section/map', component: ChargingStationsMapComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.CHARGING_STATION,
        action: Action.LIST,
      },
    },
  },
];
