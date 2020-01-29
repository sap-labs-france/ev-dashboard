import { Routes } from '@angular/router';

import { Action, Entity } from 'app/types/Authorization';
import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { TransactionsComponent } from './transactions.component';

export const TransactionsRoutes: Routes = [
  {
    path: '', component: TransactionsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.TRANSACTIONS,
        action: Action.LIST,
      },
    },
  },
];
