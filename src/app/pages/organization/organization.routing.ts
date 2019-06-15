import { Routes } from '@angular/router';

import { ComponentEnum } from '../../services/component.service';
import { RouteGuardService } from '../../services/route-guard.service';
import { Constants } from '../../utils/Constants';
import { OrganizationComponent } from './organization.component';

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
