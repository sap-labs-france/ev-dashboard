import { Routes } from '@angular/router';
import { RouteGuardService } from '../../services/route-guard.service';
import { Constants } from '../../utils/Constants';
import { LogsListComponent } from './list/logs-list.component';

export const LogsRoutes: Routes = [
  {
    path: '', component: LogsListComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_LOGGINGS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
