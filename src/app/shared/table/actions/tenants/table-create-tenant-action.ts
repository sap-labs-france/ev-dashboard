import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TenantButtonAction } from '../../../../types/Tenant';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateTenantActionDef extends TableActionDef {
  action: (tenantDialogComponent: ComponentType<unknown>, dialog: MatDialog,
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

  private createTenant(tenantDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(tenantDialogComponent, dialog, null, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.XL,
      height: ScreenSize.L
    });
  }
}
