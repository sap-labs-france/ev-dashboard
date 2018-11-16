import { Routes } from '@angular/router';

import { ChargeStationsComponent } from './chargestations.component';
import { RouteGuardService } from '../../services/route-guard.service';

export const ChargeStationsRoutes: Routes = [
    { path: '', component: ChargeStationsComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true } }
];
