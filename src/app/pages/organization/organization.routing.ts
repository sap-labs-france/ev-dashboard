import { Routes } from '@angular/router';
import TenantComponents from 'app/types/TenantComponents';
import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
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
