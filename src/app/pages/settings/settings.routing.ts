import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Actions, Entities } from '../../types/Authorization';
import { SettingsComponent } from './settings.component';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.SETTING,
        action: Actions.UPDATE,
      },
    },
  },
];
