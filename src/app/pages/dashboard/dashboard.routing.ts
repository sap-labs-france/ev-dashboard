import {Routes} from '@angular/router';

import {DashboardComponent} from './dashboard.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const DashboardRoutes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [RouteGuardService]
  }
];
