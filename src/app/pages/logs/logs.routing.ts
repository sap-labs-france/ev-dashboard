import { Routes } from '@angular/router';
import { Action, Entity } from 'app/types/Authorization';

import { RouteGuardService } from '../../guard/route-guard';
import { LogsListComponent } from './list/logs-list.component';

export const LogsRoutes: Routes = [
  {
    path: '', component: LogsListComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.LOGGINGS,
        action: Action.LIST,
      },
    },
  },
];
