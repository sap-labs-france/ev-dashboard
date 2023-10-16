import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantComponents } from 'types/Tenant';

import { BrowserNotSupportedComponent } from './browser-not-supported/browser-not-supported.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { Action, Entity } from './types/Authorization';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: async () =>
      (await import('./authentication/authentication.module')).AuthenticationModule,
  },
  {
    path: 'verify-email',
    redirectTo: 'auth/verify-email',
    pathMatch: 'full',
  },
  {
    path: 'define-password',
    redirectTo: 'auth/define-password',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'charging-stations',
        pathMatch: 'full',
      },
      {
        path: 'charging-stations',
        loadChildren: async () =>
          (await import('./pages/charging-stations/charging-stations.module'))
            .ChargingStationsModule,
        data: {
          menu: {
            title: 'charging_stations',
            type: 'link',
            icon: 'ev_station',
            path: '/charging-stations',
          },
          auth: {
            entity: Entity.CHARGING_STATION,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'reservations',
        loadChildren: async () =>
          (await import('./pages/reservations/reservations.module')).ReservationsModule,
        data: {
          menu: {
            title: 'reservations',
            type: 'link',
            icon: 'book',
            path: '/reservations',
          },
          auth: {
            entity: Entity.RESERVATION,
            action: Action.LIST,
          },
          activeInSuperTenant: false,
          displayInSuperTenant: false,
          component: TenantComponents.RESERVATION,
        },
      },
      {
        path: 'transactions',
        loadChildren: async () =>
          (await import('./pages/transactions/transactions.module')).TransactionsModule,
        data: {
          menu: {
            title: 'transactions',
            type: 'link',
            icon: 'history',
            path: '/transactions',
          },
          auth: {
            entity: Entity.TRANSACTION,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'tenants',
        loadChildren: async () => (await import('./pages/tenants/tenants.module')).TenantsModule,
        data: {
          menu: {
            title: 'tenants',
            type: 'link',
            icon: 'account_balance',
            path: '/tenants',
          },
          auth: {
            entity: Entity.TENANT,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'invoices',
        loadChildren: async () => (await import('./pages/invoices/invoices.module')).InvoicesModule,
        data: {
          menu: {
            title: 'invoices',
            type: 'link',
            icon: 'receipt',
            path: '/invoices',
          },
          auth: {
            entity: Entity.INVOICE,
            action: Action.LIST,
          },
          activeInSuperTenant: false,
          displayInSuperTenant: false,
          component: TenantComponents.BILLING,
        },
      },
      {
        path: 'cars',
        loadChildren: async () => (await import('./pages/cars/cars.module')).CarsModule,
        data: {
          menu: {
            title: 'cars',
            type: 'link',
            icon: 'directions_car',
            path: '/cars',
          },
          auth: [
            { entity: Entity.CAR_CATALOG, action: Action.LIST },
            { entity: Entity.CAR, action: Action.LIST },
          ],
          activeInSuperTenant: true,
          displayInSuperTenant: true,
          component: TenantComponents.CAR,
        },
      },
      {
        path: 'users',
        loadChildren: async () => (await import('./pages/users/users.module')).UsersModule,
        data: {
          menu: {
            title: 'users',
            type: 'link',
            icon: 'people',
            path: '/users',
          },
          auth: {
            entity: Entity.USER,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'charging-station-templates',
        loadChildren: async () =>
          (await import('./pages/charging-station-templates/charging-station-templates.module'))
            .ChargingStationTemplatesModule,
        data: {
          menu: {
            title: 'charging_station_templates',
            type: 'link',
            icon: 'assignment',
            path: '/charging-station-templates',
          },
          auth: {
            entity: Entity.CHARGING_STATION_TEMPLATE,
            action: Action.LIST,
          },
          activeInSuperTenant: true,
          displayInSuperTenant: true,
          component: TenantComponents.CHARGING_STATION_TEMPLATE,
        },
      },
      {
        path: 'tags',
        loadChildren: async () => (await import('./pages/tags/tags.module')).TagsModule,
        data: {
          menu: {
            title: 'tags',
            type: 'link',
            icon: 'badge',
            path: '/tags',
          },
          auth: {
            entity: Entity.TAG,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'assets',
        loadChildren: async () => (await import('./pages/assets/assets.module')).AssetsModule,
        data: {
          menu: {
            title: 'assets',
            type: 'link',
            icon: 'account_balance',
            path: '/assets',
          },
          auth: {
            entity: Entity.ASSET,
            action: Action.LIST,
          },
          component: TenantComponents.ASSET,
        },
      },
      {
        path: 'organization',
        loadChildren: async () =>
          (await import('./pages/organization/organization.module')).OrganizationModule,
        data: {
          menu: {
            title: 'organization',
            type: 'link',
            icon: 'business',
            path: '/organization',
          },
          auth: [
            { entity: Entity.COMPANY, action: Action.LIST },
            { entity: Entity.SITE, action: Action.LIST },
            { entity: Entity.SITE_AREA, action: Action.LIST },
          ],
          component: TenantComponents.ORGANIZATION,
        },
      },
      {
        path: 'statistics',
        loadChildren: async () =>
          (await import('./pages/statistics/statistics.module')).StatisticsModule,
        data: {
          menu: {
            title: 'statistics',
            type: 'link',
            icon: 'assessment',
            path: '/statistics',
          },
          auth: {
            entity: Entity.TRANSACTION,
            action: Action.LIST,
          },
          component: TenantComponents.STATISTICS,
        },
      },
      {
        path: 'settings-integration',
        loadChildren: async () =>
          (await import('./pages/settings-integration/settings-integration.module'))
            .SettingsIntegrationModule,
        data: {
          menu: {
            title: 'integration_settings',
            type: 'link',
            icon: 'settings',
            path: '/settings-integration',
          },
          auth: {
            entity: Entity.SETTING,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'settings-technical',
        loadChildren: async () =>
          (await import('./pages/settings-technical/settings-technical.module'))
            .SettingsTechnicalModule,
        data: {
          menu: {
            title: 'technical_settings',
            type: 'link',
            icon: 'settings_applications',
            path: '/settings-technical',
          },
          auth: {
            entity: Entity.SETTING,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'logs',
        loadChildren: async () => (await import('./pages/logs/logs.module')).LogsModule,
        data: {
          menu: {
            title: 'logs',
            type: 'link',
            icon: 'list',
            path: '/logs',
          },
          auth: {
            entity: Entity.LOGGING,
            action: Action.LIST,
          },
        },
      },
      {
        path: 'release-notes',
        component: ReleaseNotesComponent,
      },
    ],
  },
  {
    path: 'browser-not-supported',
    component: BrowserNotSupportedComponent,
  },
  {
    path: '**',
    redirectTo: 'charging-stations',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
