import { Routes } from '@angular/router';

import { RouteGuardService } from '../../services/route-guard.service';
import { Constants } from '../../utils/Constants';
import { SettingsComponent } from './settings.component';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_SETTING,
        action: Constants.ACTION_UPDATE,
      },
    },
  },
];
