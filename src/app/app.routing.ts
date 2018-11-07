import {RouterModule, Routes} from '@angular/router';

import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';
import {ReleaseNotesComponent} from './release-notes/release-notes.component';
import {RouteGuardService} from './services/route-guard.service';
import {ModuleWithProviders} from '@angular/core';
import {NotFoundComponent} from './pages/notfound/not-found.component';
import {TenantGuard} from './guard/tenant.guard';

export const AppRoutes: Routes = [
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full',
  },
  {
    path: 'not-found', component: NotFoundComponent, canActivate: [TenantGuard]
  },
  {
    path: 'verify-email', redirectTo: 'auth/verify-email', pathMatch: 'full',
  },
  {
    path: 'reset-password', redirectTo: 'auth/reset-password', pathMatch: 'full',
  },
  {
    path: '', component: AdminLayoutComponent, canActivateChild: [TenantGuard],
    children: [
      {path: '', loadChildren: './pages/dashboard/dashboard.module#DashboardModule'},
      {path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardModule'},
      {path: 'users', loadChildren: './pages/users/users.module#UsersModule'},
      {path: 'logs', loadChildren: './pages/logs/logs.module#LogsModule'},
      {path: 'tenants', loadChildren: './pages/tenants/tenants.module#TenantsModule'},
      {path: 'transactions', loadChildren: './pages/transactions/transactions.module#TransactionsModule' },
      { path: 'release-notes', component: ReleaseNotesComponent, canActivate: [RouteGuardService], data: {forAdminOnly: true}},
    ]
  },
  {
    path: '', component: AuthLayoutComponent, canActivateChild: [TenantGuard],
    children: [{
      path: 'auth',
      loadChildren: './authentication/authentication.module#AuthenticationModule'
    }]
  }
];

export const AppRouting: ModuleWithProviders = RouterModule.forRoot(AppRoutes, {useHash: true});
