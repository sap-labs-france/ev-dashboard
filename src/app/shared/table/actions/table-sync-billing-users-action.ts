import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableSyncBillingUsersAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.FORCE_SYNCHRONIZE_BILLING,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.synchronize_users',
    tooltip: 'general.synchronize',
    action: this.synchronizeUsers,
  };

  private synchronizeUsers(dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.billing.synchronize_users_dialog_title'),
      translateService.instant('settings.billing.synchronize_users_dialog_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        messageService.showInfoMessage('settings.billing.synchronize_users_started');
        centralServerService.synchronizeUsersForBilling().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (synchronizeResponse.inSuccess) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.synchronize_users_success',
                {number: synchronizeResponse.inSuccess}));
            } else if (!synchronizeResponse.inError) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.synchronize_users_success_all'));
            }
            if (synchronizeResponse.inError) {
              messageService.showWarningMessage(translateService.instant('settings.billing.synchronize_users_failure',
                {number: synchronizeResponse.inError}));
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.billing.synchronize_users_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.billing.synchronize_users_error');
        });
      }
    });
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
