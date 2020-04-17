import { Routes } from '@angular/router';
import { Action, Entity } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
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
