import { Routes } from '@angular/router';

import { ChargingStationsComponent } from './charging-stations.component';
import { RouteGuardService } from '../../services/route-guard.service';
import { ChargingStationComponent } from './charging-station-dialog/charging-station.component';

export const ChargingStationsRoutes: Routes = [
    { path: ':id', component: ChargingStationComponent, canActivate: [RouteGuardService] },
    { path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true } }
];
