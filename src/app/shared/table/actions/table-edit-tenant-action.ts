import { Tenant, TenantButtonAction } from 'app/types/Tenant';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';
import { TenantDialogComponent } from 'app/pages/tenants/tenant/tenant.dialog.component';

export class TableEditTenantAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TenantButtonAction.EDIT_TENANT,
      action: this.editTenant,
    };
  }

  private editTenant(tenant: Tenant, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(TenantDialogComponent, tenant, dialog, refresh);
  }
}
