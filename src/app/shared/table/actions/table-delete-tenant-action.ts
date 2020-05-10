import { ButtonType, TableActionDef } from 'app/types/Table';
import { Tenant, TenantButtonAction } from 'app/types/Tenant';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

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
    dialogService.createAndShowYesNoDialog(
      translateService.instant('tenants.delete_title'),
      translateService.instant('tenants.delete_confirm', {name: tenant.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        centralServerService.deleteTenant(tenant.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('tenants.delete_success', {name: tenant.name});
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, 'tenants.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'tenants.delete_error');
        });
      }
    });
  }
}
