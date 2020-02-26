import { Routes } from '@angular/router';
import { RouteGuardService } from 'app/guard/route-guard';
import { Action, Entity } from 'app/types/Authorization';
import TenantComponents from 'app/types/TenantComponents';
import { BuildingsComponent } from './buildings.component';


export const BuildingsRoutes: Routes = [
  {
    path: '', component: BuildingsComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.BUILDING,
      auth: {
        entity: Entity.BUILDINGS,
        action: Action.LIST,
      },
    },
  },
];
