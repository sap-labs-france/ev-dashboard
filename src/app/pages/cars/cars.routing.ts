import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TenantComponents } from '../../types/Tenant';
import { CarsComponent } from './cars.component';

export const CarsRoutes: Routes = [
  {
    path: '',
    component: CarsComponent,
    canActivate: [RouteGuardService],
    data: {
      component: TenantComponents.CAR,
      auth: {
        entity: Entity.CAR_CATALOG,
        action: Action.LIST,
      },
    },
  },
];
