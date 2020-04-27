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

export class TableForceSyncBillingUserAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.BILLING_FORCE_SYNCHRONIZE_USER,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.force_synchronize_users',
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
      translateService.instant('settings.billing.force_synchronize_user_dialog_title'),
      translateService.instant('settings.billing.force_synchronize_user_dialog_confirm', { userFullName: Utils.buildUserFullName(user) }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.forceSynchronizeUserForBilling(user.id).subscribe((synchronizeResponse) => {
          spinnerService.hide();
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (refresh) {
              refresh().subscribe();
            }
            messageService.showSuccessMessage(
              translateService.instant('settings.billing.force_synchronize_user_success',
              { userFullName: Utils.buildUserFullName(user) }));
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService,
              'settings.billing.force_synchronize_user_failure');
          }
        }, (error) => {
          spinnerService.hide();
          messageService.showErrorMessage(
            translateService.instant(['settings.billing.billing_system_error']));
        });
      }
    });
  }
}
