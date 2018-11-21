import {Routes} from '@angular/router';

import {UserComponent} from './user/user.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {UsersComponent} from './users.component';

export const UserRoutes: Routes = [
  {path: ':id', component: UserComponent, canActivate: [RouteGuardService]},
  {path: '', component: UsersComponent, canActivate: [RouteGuardService], data: {forAdminOnly: true, forSuperAdminOnly: true}},
];
