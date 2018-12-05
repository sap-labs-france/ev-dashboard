import {Routes} from '@angular/router';

import {TransactionsComponent} from './transactions.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const TransactionsRoutes: Routes = [
  {path: '', component: TransactionsComponent, canActivate: [RouteGuardService]}
];
