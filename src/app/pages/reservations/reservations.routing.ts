import { Routes } from '@angular/router';
import { Action, Entity } from 'types/Authorization';
import { RouteGuardService } from 'guard/route-guard';
import { ReservationsComponent } from './reservations.component';

export const ReservationsRoutes: Routes = [
  {
    path: '',
    component: ReservationsComponent,
    canActivate: [RouteGuardService],
    data: {
      auth: {
        entity: Entity.RESERVATION,
        action: Action.LIST,
      },
    },
  },
];
