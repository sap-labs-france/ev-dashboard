import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { RouteGuardService } from './service/route-guard.service';

export const AppRoutes: Routes = [
    {
        path: '', redirectTo: 'dashboard', pathMatch: 'full',
    }, {
        path: '', component: AdminLayoutComponent,
        children: [
            { path: '', loadChildren: './pages/dashboard/dashboard.module#DashboardModule' },
            { path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardModule' },
            { path: 'users', loadChildren: './pages/users/users.module#UsersModule' },
            { path: 'logs', loadChildren: './pages/logs/logs.module#LogsModule' },
            { path: 'release-notes', component: ReleaseNotesComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true } },
        ]
    }, {
        path: '', component: AuthLayoutComponent,
        children: [{
            path: 'auth',
            loadChildren: './authentication/authentication.module#AuthenticationModule'
        }]
    }
];
