import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { TableAction } from './table-action';

export class TableForceSyncBillingAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.BILLING_FORCE_SYNCHRONIZE_USER,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.force_synchronize',
    tooltip: 'general.force_synchronize',
    action: this.forceSynchronizeUser,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
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
        centralServerService.forceSynchronizeUserForBilling(user.id).subscribe((synchronizeResponse) => {
          spinnerService.hide();
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (refresh) {
              refresh().subscribe();
            }
            messageService.showSuccessMessage(
              translateService.instant('settings.billing.user.force_synchronize_user_success',
              { userFullName: Utils.buildUserFullName(user) }));
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService,
              'settings.billing.user.force_synchronize_user_failure');
          }

          // Synchronize invoices after user synchronization
          centralServerService.forceSynchronizeUserInvoicesForBilling(user.id).subscribe((synchronizeResponse2) => {
            if (synchronizeResponse.status === RestResponse.SUCCESS) {
              if (synchronizeResponse2.inSuccess) {
                messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success',
                  {number: synchronizeResponse2.inSuccess}));
              } else if (!synchronizeResponse2.inError) {
                messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success_all'));
              }
              if (synchronizeResponse2.inError) {
                messageService.showWarningMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_failure',
                  {number: synchronizeResponse2.inError}));
              }
            } else {
              Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.billing.invoice.synchronize_invoices_error');
            }
          }, (error) => {
            Utils.handleHttpError(error, router, messageService, centralServerService,
              'settings.billing.invoice.synchronize_invoices_error');
          });
        }, (error) => {
          spinnerService.hide();
          messageService.showErrorMessage(
            translateService.instant(['settings.billing.billing_system_error']));
        });
      }
    });
  }
}
