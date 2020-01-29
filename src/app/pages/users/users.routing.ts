import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from './../../types/Authorization';
import { UserConnectionComponent } from './connections/user-connection.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users.component';

export const UserRoutes: Routes = [
  {
    path: 'connections', component: UserConnectionComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.USER,
        action: Action.UPDATE,
      },
    },
  },
  {
    path: ':id', component: UserComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.USER,
        action: Action.UPDATE,
      },
    },
  },
  {
    path: '', component: UsersComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.USER,
        action: Action.CREATE,
      },
    },
  },
];
