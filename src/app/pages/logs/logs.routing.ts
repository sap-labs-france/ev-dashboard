import { Routes } from '@angular/router';

import { LogsComponent } from './logs.component';
import { RouteGuardService } from '../../service/route-guard.service';

export const LogsRoutes: Routes = [
    { path: '', component: LogsComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true } }
];
