import { Routes } from '@angular/router';

import { ComponentType } from '../../services/component.service';
import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { OrganizationComponent } from './organization.component';

export const OrganizationRoutes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.ORGANIZATION,
      auth: {
        entity: Constants.ENTITY_COMPANIES,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
