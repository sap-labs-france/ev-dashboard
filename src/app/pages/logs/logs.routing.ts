import {Routes} from '@angular/router';

import {LogsComponent} from './logs.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const LogsRoutes: Routes = [
  {path: '', component: LogsComponent, canActivate: [RouteGuardService], data: {forAdminOnly: true, forSuperAdminOnly: true}}
];
