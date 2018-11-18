import { Routes } from '@angular/router';

import { ChargingStationsComponent } from './charging-stations.component';
import { RouteGuardService } from '../../services/route-guard.service';

export const ChargingStationsRoutes: Routes = [
    { path: '', component: ChargingStationsComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true } }
];
