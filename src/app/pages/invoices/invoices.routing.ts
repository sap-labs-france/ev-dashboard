import { Routes } from '@angular/router';
import { RouteGuardService } from 'app/guard/route-guard';
import { Action, Entity } from 'app/types/Authorization';
import TenantComponents from 'app/types/TenantComponents';
import { InvoicesComponent } from './invoices.component';

export const AssetsRoutes: Routes = [
  {
    path: '', component: InvoicesComponent, canActivate: [RouteGuardService], data: {
      component: TenantComponents.BILLING,
      auth: {
        entity: Entity.INVOICES,
        action: Action.LIST,
      },
    },
  },
];
