import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TenantComponents } from '../../types/Tenant';
import { AssetsComponent } from './assets.component';

export const AssetsRoutes: Routes = [
  {
    path: '',
    component: AssetsComponent,
    canActivate: [RouteGuardService],
    data: {
      component: TenantComponents.ASSET,
      auth: {
        entity: Entity.ASSET,
        action: Action.LIST,
      },
    },
  },
];
