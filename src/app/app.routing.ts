import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { AuthenticationGuard } from './authentication/authentication-guard';

export const AppRoutes: Routes = [
    {
        path: '', redirectTo: 'dashboard', pathMatch: 'full',
    }, {
        path: '', component: AdminLayoutComponent,
        children: [
            { path: '', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            { path: 'users', loadChildren: './users/users.module#UsersModule' },
            { path: 'release-notes', component: ReleaseNotesComponent, canActivate: [AuthenticationGuard], data: { forAdminOnly: true } },
        ]
    }, {
        path: '', component: AuthLayoutComponent,
        children: [{
            path: 'auth',
            loadChildren: './authentication/authentication.module#AuthenticationModule'
        }]
    }
];
