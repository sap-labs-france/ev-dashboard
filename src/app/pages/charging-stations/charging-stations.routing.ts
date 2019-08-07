import { Routes } from '@angular/router';
import { RouteGuardService } from '../../services/route-guard.service';
import { Constants } from '../../utils/Constants';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationComponent } from './charging-station/charging-station.component';

export const ChargingStationsRoutes: Routes = [
  {
    path: ':id', component: ChargingStationComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATION,
        action: Constants.ACTION_READ
      }
    }
  },
  {
    path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_CHARGING_STATIONS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
