import { Routes } from '@angular/router';

import { RouteGuardService } from 'app/guard/route-guard';
import { ComponentType } from 'app/services/component.service';
import { Action, Entity } from 'app/types/Authorization';
import { BuildingsComponent } from './buildings.component';

export const BuildingsRoutes: Routes = [
  {
    path: '', component: BuildingsComponent, canActivate: [RouteGuardService], data: {
      component: ComponentType.BUILDING,
      auth: {
        entity: Entity.BUILDINGS,
        action: Action.LIST,
      },
    },
  },
];
