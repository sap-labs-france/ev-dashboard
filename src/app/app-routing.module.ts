import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrowserNotSupportedComponent } from './browser-not-supported/browser-not-supported.component';
import { DevEnvGuard } from './guard/development.guard';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { Action, Entity } from './types/Authorization';
import TenantComponents from './types/TenantComponents';

const routes: Routes = [
  {
    path: 'auth', component: AuthLayoutComponent,
    loadChildren: async () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule),
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
      {
        path: '',
        redirectTo: 'charging-stations',
        pathMatch: 'full'
      },
      {
        path: 'charging-stations',
        loadChildren: async () => import('./pages/charging-stations/charging-stations.module').then((m) => m.ChargingStationsModule),
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
        loadChildren: async () => import('./pages/transactions/transactions.module').then((m) => m.TransactionsModule),
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
        path: 'tenants',
        loadChildren: async () => import('./pages/tenants/tenants.module').then((m) => m.TenantsModule),
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
        path: 'invoices',
        loadChildren: async () => import('./pages/invoices/invoices.module').then((m) => m.InvoicesModule),
        data: {
          menu: {
            title: 'invoices',
            type: 'link',
            icon: 'receipt',
            path: '/invoices',
          },
          auth: {
            entity: Entity.INVOICES,
            action: Action.LIST,
          },
          activeInSuperTenant: false,
          displayInSuperTenant: false,
          component: TenantComponents.BILLING,
        },
      },
      {
        path: 'car',
        loadChildren: async () => import('./pages/cars/cars.module').then((m) => m.CarsModule),
        data: {
          menu: {
            title: 'cars',
            type: 'link',
            icon: 'directions_car',
            path: '/car',
          },
          auth: {
            entity: Entity.CAR_CATALOGS,
            action: Action.LIST,
          },
          activeInSuperTenant: true,
          displayInSuperTenant: true,
          component: TenantComponents.CAR,
        },
      },
      {
        path: 'users',
        loadChildren: async () => import('./pages/users/users.module').then((m) => m.UsersModule),
        data: {
          menu: {
            title: 'users',
            type: 'link',
            icon: 'people',
            path: '/users',
          },
          auth: {
            entity: Entity.USERS,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'asset',
        loadChildren: async () => import('./pages/assets/assets.module').then((m) => m.AssetsModule),
        data: {
          menu: {
            title: 'assets',
            type: 'link',
            icon: 'account_balance',
            path: '/asset',
          },
          auth: {
            entity: Entity.ASSETS,
            action: Action.LIST,
          },
          component: TenantComponents.ASSET,
        },
      },
      {
        path: 'organization',
        loadChildren: async () => import('./pages/organization/organization.module').then((m) => m.OrganizationModule),
        data: {
          menu: {
            title: 'organization',
            type: 'link',
            icon: 'business',
            path: '/organization',
          },
          auth: [
            { entity: Entity.COMPANIES, action: Action.LIST },
            { entity: Entity.SITES, action: Action.LIST },
            { entity: Entity.SITE_AREAS, action: Action.LIST },
          ],
          component: TenantComponents.ORGANIZATION,
        },
      },
      {
        path: 'template',
        canLoad: [DevEnvGuard],
        loadChildren: async () => import('./pages/template/template.module').then((m) => m.TemplateModule),
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
      {
        path: 'statistics',
        loadChildren: async () => import('./pages/statistics/statistics.module').then((m) => m.StatisticsModule),
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
        path: 'settings-integration',
        loadChildren: async () => import('./pages/settings-integration/settings-integration.module').then((m) => m.SettingsIntegrationModule),
        data: {
          menu: {
            title: 'integration_settings',
            type: 'link',
            icon: 'settings',
            path: '/settings-integration',
          },
          auth: {
            entity: Entity.SETTING,
            action: Action.CREATE,
          },
        },
      },
      {
        path: 'settings-technical',
        loadChildren: async () => import('./pages/settings-technical/settings-technical.module').then((m) => m.SettingsTechnicalModule),
        data: {
          menu: {
            title: 'technical_settings',
            type: 'link',
            icon: 'settings_applications',
            path: '/settings-technical',
          },
          auth: {
            entity: Entity.SETTING,
            action: Action.CREATE,
          },
        },
      },
      {
        path: 'logs',
        loadChildren: async () => import('./pages/logs/logs.module').then((m) => m.LogsModule),
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
    ],
  },
  {
    path: 'browser-not-supported', component: BrowserNotSupportedComponent,
  },
  {
    path: '**', redirectTo: 'charging-stations', pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
