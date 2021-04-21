import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';

import { TableActionDef } from '../../../../types/Table';
import { Tenant, TenantButtonAction } from '../../../../types/Tenant';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateTenantActionDef extends TableActionDef {
  action: (tenantDialogComponent: ComponentType<unknown>, dialog: MatDialog, dialogParams: DialogParams<Tenant>,
    refresh?: () => Observable<void>) => void;
}

export class TableCreateTenantAction extends TableCreateAction {
  public getActionDef(): TableCreateTenantActionDef {
    return {
      ...super.getActionDef(),
      id: TenantButtonAction.CREATE_TENANT,
      action: this.createTenant,
    };
  }

  private createTenant(tenantDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tenant>, refresh?: () => Observable<void>) {
    super.create(tenantDialogComponent, dialog, dialogParams, refresh);
  }
}
