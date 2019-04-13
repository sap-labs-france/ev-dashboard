import {Routes} from '@angular/router';
import {RouteGuardService} from '../../services/route-guard.service';
import {TemplateComponent} from './template.component'
import {Constants} from '../../utils/Constants';

export const TemplateRoutes: Routes = [
  {
    path: '', component: TemplateComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_LOGGINGS,
        action: Constants.ACTION_LIST
      },
    }
  }
];
