import {Routes} from '@angular/router';

import {OrganizationsComponent} from './organizations.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const OrganizationsRoutes: Routes = [
  {
    path: '', component: OrganizationsComponent, canActivate: [RouteGuardService]
  }
];
