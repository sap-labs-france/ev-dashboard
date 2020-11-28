import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import TenantComponents from '../../types/TenantComponents';
import { OrganizationComponent } from './organization.component';

export const OrganizationRoutes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.ORGANIZATION,
      auth: {
        entity: Entity.COMPANIES,
        action: Action.LIST,
      },
    },
  },
];
