import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { SettingsTechnicalComponent } from './settings-technical.component';

export const TechnicalSettingsRoutes: Routes = [
  {
    path: '',
    component: SettingsTechnicalComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.SETTING,
        action: Action.LIST,
      },
    },
  },
];
