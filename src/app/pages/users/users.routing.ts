import {Routes} from '@angular/router';

import {UserComponent} from './user/user.component';
import {RouteGuardService} from '../../services/route-guard.service';

export const UserRoutes: Routes = [
  {path: ':id', component: UserComponent, canActivate: [RouteGuardService]},
];
