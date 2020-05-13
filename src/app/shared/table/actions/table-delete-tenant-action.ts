import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActionDef } from 'app/types/Table';
import { Tenant, TenantButtonAction } from 'app/types/Tenant';
import { Observable } from 'rxjs';

import { TableDeleteAction } from './table-delete-action';

export class TableDeleteTenantAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TenantButtonAction.DELETE_TENANT,
      action: this.deleteTenant,
    };
  }

  private deleteTenant(tenant: Tenant, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      tenant, 'tenants.delete_title',
      translateService.instant('tenants.delete_confirm', { name: tenant.name }),
      translateService.instant('tenants.delete_success', { name: tenant.name }),
      'tenants.delete_error', centralServerService.deleteTenant.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
