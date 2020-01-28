import { Routes } from '@angular/router';
import { Actions, Entities } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationsComponent } from './charging-stations.component';

export const ChargingStationsRoutes: Routes = [
  {
    path: ':id', component: ChargingStationDialogComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.CHARGING_STATION,
        action: Actions.READ,
      },
    },
  },
  {
    path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.CHARGING_STATIONS,
        action: Actions.LIST,
      },
    },
  },
];
