import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TransactionsComponent } from './transactions.component';

export const TransactionsRoutes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.TRANSACTION,
        action: Action.LIST,
      },
    },
  },
];
