import {Routes} from '@angular/router';

import {ChargingStationsComponent} from './charging-stations.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {ChargingStationComponent} from './charging-station-settings/charging-station.component';
import {Constants} from '../../utils/Constants';

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
