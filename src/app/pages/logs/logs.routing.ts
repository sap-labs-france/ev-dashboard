import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { LogsListComponent } from './list/logs-list.component';

export const LogsRoutes: Routes = [
  {
    path: '',
    component: LogsListComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.LOGGING,
        action: Action.LIST,
      },
    },
  },
];
