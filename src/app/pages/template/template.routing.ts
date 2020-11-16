import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TemplateComponent } from './template.component';

export const TemplateRoutes: Routes = [
  {
    path: '', component: TemplateComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.LOGGINGS,
        action: Action.LIST,
      },
    },
  },
];
