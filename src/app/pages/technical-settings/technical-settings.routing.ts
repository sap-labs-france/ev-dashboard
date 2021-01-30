import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TechnicalSettingsComponent } from './technical-settings.component';

export const TechnicalSettingsRoutes: Routes = [
  {
    path: '', component: TechnicalSettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.SETTING,
        action: Action.CREATE,
      },
    },
  },
];
