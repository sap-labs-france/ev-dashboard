import {Routes} from '@angular/router';

import {TransactionsComponent} from './transactions.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {Constants} from '../../utils/Constants';

export const TransactionsRoutes: Routes = [
  {
    path: '', component: TransactionsComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_TRANSACTIONS,
        action: Constants.ACTION_LIST
      }
    }
  }
];
