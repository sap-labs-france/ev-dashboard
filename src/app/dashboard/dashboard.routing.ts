import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { RouteGuardService } from '../service/route-guard.service';

export const DashboardRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [RouteGuardService] }
        ]
    }
];
