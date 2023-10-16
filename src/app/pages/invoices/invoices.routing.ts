import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { TenantComponents } from '../../types/Tenant';
import { InvoicesComponent } from './invoices.component';

export const InvoicesRoutes: Routes = [
  {
    path: '',
    component: InvoicesComponent,
    canActivate: [RouteGuardService],
    data: {
      component: TenantComponents.BILLING,
      auth: {
        entity: Entity.INVOICE,
        action: Action.LIST,
      },
    },
  },
];
