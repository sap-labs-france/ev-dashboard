import {Routes} from '@angular/router';

import {SettingsComponent} from './settings.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {Constants} from '../../utils/Constants';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_SETTINGS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
