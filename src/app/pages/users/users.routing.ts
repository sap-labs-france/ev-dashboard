import {Routes} from '@angular/router';

import {UserComponent} from './user/user.component';
import {RouteGuardService} from '../../services/route-guard.service';
import {UsersComponent} from './users.component';
import {Constants} from '../../utils/Constants';

export const UserRoutes: Routes = [
  {
    path: ':id', component: UserComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Constants.ENTITY_USER,
        action: Constants.ACTION_UPDATE
      }
    }
  },
  {path: '', component: UsersComponent, canActivate: [RouteGuardService], data: {forAdminOnly: true, forSuperAdminOnly: true}},
];
