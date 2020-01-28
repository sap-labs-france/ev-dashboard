import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Entities } from '../../types/Authorization';
import { Constants } from '../../utils/Constants';
import { SettingsComponent } from './settings.component';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.SETTING,
        action: Constants.ACTION_UPDATE,
      },
    },
  },
];
