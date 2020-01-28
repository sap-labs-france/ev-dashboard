import { Routes } from '@angular/router';
import { Actions, Entities } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
import { TemplateComponent } from './template.component';

export const TemplateRoutes: Routes = [
  {
    path: '', component: TemplateComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entities.LOGGINGS,
        action: Actions.LIST,
      },
    },
  },
];
