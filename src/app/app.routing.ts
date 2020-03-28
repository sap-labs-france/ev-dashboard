import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevEnvGuard } from './guard/development.guard';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { BrowserNotSupportedComponent } from './pages/browser-not-supported/browser-not-supported.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { Action, Entity } from './types/Authorization';
import TenantComponents from './types/TenantComponents';

export const AppRoutes: Routes = [
  {
    path: 'auth', component: AuthLayoutComponent,
    loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule),
  },
  {
    path: 'verify-email', redirectTo: 'auth/verify-email', pathMatch: 'full',
  },
  {
    path: 'define-password', redirectTo: 'auth/define-password', pathMatch: 'full',
  },
  {
    path: '', component: AdminLayoutComponent,
    children: [

      {path: '', redirectTo: 'charging-stations', pathMatch: 'full'},
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
        data: {
          menu: {
            title: 'dashboard',
            type: 'link',
            icon: 'dashboard',
            path: '/dashboard',
          },
          auth: {
            entity: Entity.CHARGING_STATIONS,
            action: Action.LIST,
          },
          options: {
            onlyDev: true,
          },
        },
        canLoad: [DevEnvGuard],
      },
      {
        path: 'charging-stations',
        loadChildren: () => import('./pages/charging-stations/charging-stations.module').then((m) => m.ChargingStationsModule),
        data: {
          menu: {
            title: 'charging_stations',
            type: 'link',
            icon: 'ev_station',
            path: '/charging-stations',
          },
          auth: {
            entity: Entity.CHARGING_STATIONS,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'transactions',
        loadChildren: () => import('./pages/transactions/transactions.module').then((m) => m.TransactionsModule),
        data: {
          menu: {
            title: 'transactions',
            type: 'link',
            icon: 'history',
            path: '/transactions',
          },
          auth: {
            entity: Entity.TRANSACTIONS,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'statistics',
        loadChildren: () => import('./pages/statistics/statistics.module').then((m) => m.StatisticsModule),
        data: {
          menu: {
            title: 'statistics',
            type: 'link',
            icon: 'assessment',
            path: '/statistics',
          },
          auth: {
            entity: Entity.TRANSACTIONS,
            action: Action.LIST,
          },
          component: TenantComponents.STATISTICS,
        },
      },
      {
        path: 'tenants',
        loadChildren: () => import('./pages/tenants/tenants.module').then((m) => m.TenantsModule),
        data: {
          menu: {
            title: 'tenants',
            type: 'link',
            icon: 'account_balance',
            path: '/tenants',
          },
          auth: {
            entity: Entity.TENANTS,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then((m) => m.UsersModule),
        data: {
          menu: {
            title: 'users',
            type: 'link',
            icon: 'people',
            path: '/users',
          },
          auth: {
            entity: Entity.USER,
            action: Action.CREATE,
          },
        },
      },
      {
        path: 'invoices',
        loadChildren: () => import('./pages/invoices/invoices.module').then((m) => m.InvoicesModule),
        data: {
          menu: {
            title: 'invoices',
            type: 'link',
            icon: 'description',
            path: '/invoices',
          },
          auth: {
            entity: Entity.INVOICES,
            action: Action.LIST,
          },
          component: TenantComponents.BILLING,
        },
      },
      {
        path: 'organization',
        loadChildren: () => import('./pages/organization/organization.module').then((m) => m.OrganizationModule),
        data: {
          menu: {
            title: 'organization',
            type: 'link',
            icon: 'business',
            path: '/organization',
          },
          auth: {
            entity: Entity.COMPANIES,
            action: Action.LIST,
          },
          component: TenantComponents.ORGANIZATION,
        },
      },
      {
        path: 'building',
        loadChildren: () => import('./pages/buildings/buildings.module').then((m) => m.BuildingsModule),
        data: {
          menu: {
            title: 'buildings',
            type: 'link',
            icon: 'account_balance',
            path: '/building',
          },
          auth: {
            entity: Entity.BUILDINGS,
            action: Action.LIST,
          },
          component: TenantComponents.BUILDING,
        },
      },
      {
        path: 'car',
        loadChildren: () => import('./pages/cars/cars.module').then((m) => m.CarsModule),
        data: {
          menu: {
            title: 'cars',
            type: 'link',
            icon: 'directions_car',
            path: '/car',
          },
          auth: {
            entity: Entity.CARS,
            action: Action.LIST,
          },
          activeInSuperTenant: true,
          displayInSuperTenant: true,
          component: TenantComponents.CAR,
        },
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/settings/settings.module').then((m) => m.SettingsModule),
        data: {
          menu: {
            title: 'settings',
            type: 'link',
            icon: 'settings',
            path: '/settings',
          },
          auth: {
            entity: Entity.SETTING,
            action: Action.CREATE,
          },
        },
      },
      {
        path: 'logs',
        loadChildren: () => import('./pages/logs/logs.module').then((m) => m.LogsModule),
        data: {
          menu: {
            title: 'logs',
            type: 'link',
            icon: 'list',
            path: '/logs',
          },
          auth: {
            entity: Entity.LOGGINGS,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'release-notes', component: ReleaseNotesComponent,
      },
      {
        path: 'template',
        canLoad: [DevEnvGuard],
        loadChildren: () => import('./pages/template/template.module').then((m) => m.TemplateModule),
        data: {
          menu: {
            title: 'template',
            type: 'link',
            icon: 'help',
            path: '/template',
          },
          auth: {
            entity: Entity.LOGGINGS,
            action: Action.LIST,
          },
          options: {
            onlyDev: true,
          },
        },
      },
    ],
  },
  {
    path: 'browser-not-supported', component: BrowserNotSupportedComponent,
  },
  {
    path: '**', redirectTo: 'charging-stations', pathMatch: 'full',
  },
];

export const AppRouting: ModuleWithProviders = RouterModule.forRoot(AppRoutes, {
  useHash: false,
  scrollPositionRestoration: 'enabled',
});
