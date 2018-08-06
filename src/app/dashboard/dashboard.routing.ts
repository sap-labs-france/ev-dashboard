import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { AuthenticationGuard } from '../authentication/authentication-guard';

export const DashboardRoutes: Routes = [
    {

        path: '',
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [AuthenticationGuard] }
        ]
    }
];
