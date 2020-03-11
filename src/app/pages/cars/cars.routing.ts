import { Routes } from '@angular/router';
import { RouteGuardService } from 'app/guard/route-guard';
import { Action, Entity } from 'app/types/Authorization';
import TenantComponents from 'app/types/TenantComponents';
import { CarsComponent } from './cars.component';

export const CarsRoutes: Routes = [
  {
    path: '', component: CarsComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.CAR,
      auth: {
        entity: Entity.CARS,
        action: Action.LIST,
      },
    },
  },
];
