import { Routes } from '@angular/router';

import { RouteGuardService } from 'app/guard/route-guard';
import { ComponentType } from 'app/services/component.service';
import { Action, Entity } from 'app/types/Authorization';
import { BuildingComponent } from './building.component';

export const BuildingRoutes: Routes = [
  {
    path: '', component: BuildingComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.BUILDING,
      auth: {
        entity: Entity.BUILDINGS,
        action: Action.LIST,
      },
    },
  },
];
