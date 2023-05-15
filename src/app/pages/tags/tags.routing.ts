import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TagsComponent } from './tags.component';

export const TagRoutes: Routes = [
  {
    path: ':id',
    component: TagsComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.TAG,
        action: Action.UPDATE,
      },
    },
  },
  {
    path: '',
    component: TagsComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.TAG,
        action: Action.LIST,
      },
    },
  },
];
