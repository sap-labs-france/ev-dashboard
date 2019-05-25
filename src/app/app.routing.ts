import {RouterModule, Routes} from '@angular/router';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';
import {ReleaseNotesComponent} from './release-notes/release-notes.component';
import {ModuleWithProviders} from '@angular/core';
import {DevEnvGuard} from './guard/development.guard';
import {Constants} from './utils/Constants';
import {ComponentEnum} from './services/component.service';


export const AppRoutes: Routes = [
  {
    path: 'auth', component: AuthLayoutComponent,
    loadChildren: './authentication/authentication.module#AuthenticationModule'
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
        path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardModule', data: {
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
        path: 'charging-stations', loadChildren: './pages/charging-stations/charging-stations.module#ChargingStationsModule', data: {
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
        path: 'transactions', loadChildren: './pages/transactions/transactions.module#TransactionsModule', data: {
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
        path: 'tenants', loadChildren: './pages/tenants/tenants.module#TenantsModule', data: {
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
        path: 'users', loadChildren: './pages/users/users.module#UsersModule', data: {
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
        path: 'organization', loadChildren: './pages/organization/organization.module#OrganizationModule', data: {
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
        path: 'settings', loadChildren: './pages/settings/settings.module#SettingsModule',
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
        path: 'logs', loadChildren: './pages/logs/logs.module#LogsModule', data: {
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
        loadChildren: './pages/template/template.module#TemplateModule',
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
