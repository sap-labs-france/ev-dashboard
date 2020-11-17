import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableActionDef } from '../../../../types/Table';
import { Tenant, TenantButtonAction } from '../../../../types/Tenant';
import { TableEditAction } from '../table-edit-action';

export interface TableEditTenantActionDef extends TableActionDef {
  action: (tenantDialogComponent: ComponentType<unknown>, tenant: Tenant, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditTenantAction extends TableEditAction {
  public getActionDef(): TableEditTenantActionDef {
    return {
      ...super.getActionDef(),
      id: TenantButtonAction.EDIT_TENANT,
      action: this.editTenant,
    };
  }

  private editTenant(tenantDialogComponent: ComponentType<unknown>, tenant: Tenant, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(tenantDialogComponent, tenant, dialog, refresh);
  }
}
