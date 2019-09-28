import { Routes } from '@angular/router';
import { RouteGuardService } from '../../services/route-guard.service';
import { Constants } from '../../utils/Constants';
import { TemplateComponent } from './template.component';

export const TemplateRoutes: Routes = [
  {
    path: '', component: TemplateComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_LOGGINGS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
