import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { SettingsIntegrationComponent } from './settings-integration.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    component: SettingsIntegrationComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.SETTING,
        action: Action.LIST,
      },
    },
  },
];
