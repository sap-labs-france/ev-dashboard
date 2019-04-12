import {Routes} from '@angular/router';

import {OrganizationComponent} from './organization.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {ComponentEnum} from '../../services/component.service';
import {Constants} from '../../utils/Constants';

export const OrganizationRoutes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [RouteGuardService], data: {
      component: ComponentEnum.ORGANIZATION,
      auth: {
        entity: Constants.ENTITY_COMPANIES,
        action: Constants.ACTION_LIST
      }
    }
  }
];
