import {Routes} from '@angular/router';

import {SettingsComponent} from './settings.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const SettingsRoutes: Routes = [
  {
    path: '', component: SettingsComponent, canActivate: [RouteGuardService]
  }
];
