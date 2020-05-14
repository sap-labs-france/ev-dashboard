import { MatDialog } from '@angular/material/dialog';
import { TenantDialogComponent } from 'app/pages/tenants/tenant/tenant.dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableActionDef } from 'app/types/Table';
import { Tenant, TenantButtonAction } from 'app/types/Tenant';
import { Observable } from 'rxjs';

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
