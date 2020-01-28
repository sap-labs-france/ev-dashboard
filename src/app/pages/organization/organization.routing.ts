import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { ComponentType } from '../../services/component.service';
import { Actions, Entities } from '../../types/Authorization';
import { OrganizationComponent } from './organization.component';

export const OrganizationRoutes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.ORGANIZATION,
      auth: {
        entity: Entities.COMPANIES,
        action: Actions.LIST,
      },
    },
  },
];
