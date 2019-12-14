import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Constants } from '../../utils/Constants';
import { TransactionsComponent } from './transactions.component';

export const TransactionsRoutes: Routes = [
  {
    path: '', component: TransactionsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_TRANSACTIONS,
        action: Constants.ACTION_LIST,
      },
    },
  },
];
