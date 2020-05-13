import { Routes } from '@angular/router';
import { RouteGuardService } from 'app/guard/route-guard';
import { Action, Entity } from 'app/types/Authorization';
import TenantComponents from 'app/types/TenantComponents';

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
