import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { SettingsComponent } from './settings.component';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.SETTING,
        action: Action.UPDATE,
      },
    },
  },
];
