import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { TableSynchronizeAction } from '../../../../shared/table/actions/table-synchronize-action';
import { BillingButtonAction } from '../../../../types/Billing';
import { RestResponse } from '../../../../types/GlobalType';
import { ButtonType, TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';

export interface TableSyncBillingUsersActionDef extends TableActionDef {
  action: (dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) => void;
}

export class TableSyncBillingUsersAction extends TableSynchronizeAction {
  public getActionDef(): TableSyncBillingUsersActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.SYNCHRONIZE_BILLING_USERS,
      name: 'settings.billing.user.synchronize_users',
      action: this.synchronizeUsers,
    };
  }

  private synchronizeUsers(dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.billing.user.synchronize_users_dialog_title'),
      translateService.instant('settings.billing.user.synchronize_users_dialog_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        messageService.showInfoMessage('settings.billing.user.synchronize_users_started');
        // Synchronize users
        centralServerService.synchronizeUsersForBilling().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (synchronizeResponse.inSuccess) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.user.synchronize_users_success',
                {number: synchronizeResponse.inSuccess}));
            } else if (!synchronizeResponse.inError) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.user.synchronize_users_success_all'));
            }
            if (synchronizeResponse.inError) {
              messageService.showWarningMessage(translateService.instant('settings.billing.user.synchronize_users_failure',
                {number: synchronizeResponse.inError}));
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.billing.user.synchronize_users_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.billing.user.synchronize_users_error');
        });
        // Synchronize invoices
        centralServerService.synchronizeInvoicesForBilling().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (synchronizeResponse.inSuccess) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success',
                {number: synchronizeResponse.inSuccess}));
            } else if (!synchronizeResponse.inError) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success_all'));
            }
            if (synchronizeResponse.inError) {
              messageService.showWarningMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_failure',
                {number: synchronizeResponse.inError}));
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.billing.invoice.synchronize_invoices_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.billing.user.synchronize_users_error');
        });
      }
    });
  }
}
