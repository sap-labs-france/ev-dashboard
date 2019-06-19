import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevEnvGuard } from './guard/development.guard';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { ComponentEnum } from './services/component.service';
import { Constants } from './utils/Constants';


export const AppRoutes: Routes = [
  {
    path: 'auth', component: AuthLayoutComponent,
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  },
  {
    path: 'verify-email', redirectTo: 'auth/verify-email', pathMatch: 'full',
  },
  {
    path: 'reset-password', redirectTo: 'auth/reset-password', pathMatch: 'full',
  },
  {
    path: '', component: AdminLayoutComponent,
    children: [

      {path: '', redirectTo: 'charging-stations', pathMatch: 'full'},
      {
        path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule), data: {
          menu: {
            title: 'dashboard',
            type: 'link',
            icon: 'dashboard',
            path: '/dashboard'
          },
          auth: {
            entity: Constants.ENTITY_CHARGING_STATIONS,
            action: Constants.ACTION_LIST
          },
          options: {
            onlyDev: true
          }
        },
        canLoad: [DevEnvGuard]
      },
      {
        path: 'charging-stations', loadChildren: () => import('./pages/charging-stations/charging-stations.module').then(m => m.ChargingStationsModule), data: {
          menu: {
            title: 'charging_stations',
            type: 'link',
            icon: 'ev_station',
            path: '/charging-stations'
          },
          auth: {
            entity: Constants.ENTITY_CHARGING_STATIONS,
            action: Constants.ACTION_LIST
          }
        }
      },
      {
        path: 'transactions', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule), data: {
          menu: {
            title: 'transactions',
            type: 'link',
            icon: 'history',
            path: '/transactions'
          },
          auth: {
            entity: Constants.ENTITY_TRANSACTIONS,
            action: Constants.ACTION_LIST
          }
        }
      },
      {
        path: 'statistics', loadChildren: () => import('./pages/statistics/statistics.module').then(m => m.StatisticsModule),
        data: {
          menu: {
            title: 'statistics',
            type: 'link',
            icon: 'assessment',
            path: '/statistics'
          },
          auth: {
            entity: Constants.ENTITY_TRANSACTIONS,
            action: Constants.ACTION_LIST
          },
          component: ComponentEnum.STATISTICS
        }
      },
      {
        path: 'tenants', loadChildren: () => import('./pages/tenants/tenants.module').then(m => m.TenantsModule), data: {
          menu: {
            title: 'tenants',
            type: 'link',
            icon: 'account_balance',
            path: '/tenants'
          },
          auth: {
            entity: Constants.ENTITY_TENANTS,
            action: Constants.ACTION_LIST
          }
        }
      },
      {
        path: 'users', loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule), data: {
          menu: {
            title: 'users',
            type: 'link',
            icon: 'people',
            path: '/users'
          },
          auth: {
            entity: Constants.ENTITY_USERS,
            action: Constants.ACTION_LIST
          }
        }
      },
      {
        path: 'organization', loadChildren: () => import('./pages/organization/organization.module').then(m => m.OrganizationModule), data: {
          menu: {
            title: 'organization',
            type: 'link',
            icon: 'business',
            path: '/organization'
          },
          auth: {
            entity: Constants.ENTITY_COMPANIES,
            action: Constants.ACTION_LIST
          },
          component: ComponentEnum.ORGANIZATION
        }
      },
      {
        path: 'settings', loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
        data: {
          menu: {
            title: 'settings',
            type: 'link',
            icon: 'settings',
            path: '/settings'
          },
          auth: {
            entity: Constants.ENTITY_SETTING,
            action: Constants.ACTION_CREATE
          }
        }
      },
      {
        path: 'logs', loadChildren: () => import('./pages/logs/logs.module').then(m => m.LogsModule), data: {
          menu: {
            title: 'logs',
            type: 'link',
            icon: 'list',
            path: '/logs'
          },
          auth: {
            entity: Constants.ENTITY_LOGGINGS,
            action: Constants.ACTION_LIST
          }
        }
      },
      {
        path: 'release-notes', component: ReleaseNotesComponent
      },
      {
        path: 'template',
        canLoad: [DevEnvGuard],
        loadChildren: () => import('./pages/template/template.module').then(m => m.TemplateModule),
        data: {
          menu: {
            title: 'template',
            type: 'link',
            icon: 'help',
            path: '/template'
          },
          auth: {
            entity: Constants.ENTITY_LOGGINGS,
            action: Constants.ACTION_LIST
          },
          options: {
            onlyDev: true
          }
        },

      },
    ]
  },
  {
    path: '**', redirectTo: 'charging-stations', pathMatch: 'full'
  }
];

export const AppRouting: ModuleWithProviders = RouterModule.forRoot(AppRoutes, {
  useHash: false,
  scrollPositionRestoration: 'enabled'
});
