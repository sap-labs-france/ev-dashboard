import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableSynchronizeAction } from '../../../../shared/table/actions/table-synchronize-action';
import { RestResponse } from '../../../../types/GlobalType';
import { ButtonType, TableActionDef } from '../../../../types/Table';
import { User, UserButtonAction } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

export interface TableForceSyncBillingUserActionDef extends TableActionDef {
  action: (user: User, dialogService: DialogService, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableForceSyncBillingUserAction extends TableSynchronizeAction {
  public getActionDef(): TableForceSyncBillingUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.BILLING_FORCE_SYNCHRONIZE_USER,
      name: 'settings.billing.force_synchronize',
      action: this.forceSynchronizeUser,
    };
  }

  private forceSynchronizeUser(user: User, dialogService: DialogService, translateService: TranslateService, spinnerService: SpinnerService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.billing.user.force_synchronize_user_dialog_title'),
      translateService.instant('settings.billing.user.force_synchronize_user_dialog_confirm', { userFullName: Utils.buildUserFullName(user) }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        // Synchronize user
        centralServerService.forceSynchronizeUserForBilling(user.id).subscribe((synchronizeUserResponse) => {
          if (synchronizeUserResponse.status !== RestResponse.SUCCESS) {
            spinnerService.hide();
            messageService.showErrorMessage(
              translateService.instant('settings.billing.user.force_synchronize_user_failure'));
          } else {
            // Synchronize invoices after user synchronization
            centralServerService.forceSynchronizeUserInvoicesForBilling(user.id).subscribe((synchronizeInvoicesResponse) => {
              spinnerService.hide();
              if (synchronizeInvoicesResponse.inSuccess >= 0 && synchronizeInvoicesResponse.inError === 0) {
                messageService.showSuccessMessage(
                  translateService.instant('settings.billing.user.force_synchronize_user_success',
                  { userFullName: Utils.buildUserFullName(user) }));
              } else {
                messageService.showErrorMessage(
                  translateService.instant('settings.billing.user.force_synchronize_user_failure'));
              }
            }, (error) => {
              spinnerService.hide();
              Utils.handleHttpError(error, router, messageService, centralServerService,
                'settings.billing.invoice.synchronize_invoices_error');
            });
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.billing.user.force_synchronize_user_failure');
        });
      }
    });
  }
}
