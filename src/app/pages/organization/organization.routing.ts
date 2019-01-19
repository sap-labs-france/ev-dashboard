import {Routes} from '@angular/router';

import {OrganizationComponent} from './organization.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const OrganizationRoutes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [RouteGuardService], data: { forAdminOnly: true }
  }
];
