import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { Tenant, TenantButtonAction } from '../../../../types/Tenant';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteTenantActionDef extends TableActionDef {
  action: (
    tenant: Tenant,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteTenantAction extends TableDeleteAction {
  public getActionDef(): TableDeleteTenantActionDef {
    return {
      ...super.getActionDef(),
      id: TenantButtonAction.DELETE_TENANT,
      action: this.deleteTenant,
    };
  }

  private deleteTenant(
    tenant: Tenant,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      tenant,
      'tenants.delete_title',
      translateService.instant('tenants.delete_confirm', { name: tenant.name }),
      translateService.instant('tenants.delete_success', { name: tenant.name }),
      'tenants.delete_error',
      centralServerService.deleteTenant.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      refresh
    );
  }
}
