import { Routes } from '@angular/router';
import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationsComponent } from './charging-stations.component';

export const ChargingStationsRoutes: Routes = [
  {
    path: ':id', component: ChargingStationDialogComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATION,
        action: Constants.ACTION_READ,
      },
    },
  },
  {
    path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATIONS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
