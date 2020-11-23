import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import TenantComponents from '../../types/TenantComponents';
import { AssetsComponent } from './assets.component';

export const AssetsRoutes: Routes = [
  {
    path: '', component: AssetsComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.ASSET,
      auth: {
        entity: Entity.ASSETS,
        action: Action.LIST,
      },
    },
  },
];
