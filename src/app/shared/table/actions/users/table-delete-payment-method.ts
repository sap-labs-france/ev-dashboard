/* eslint-disable max-len */
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BillingButtonAction, BillingPaymentMethod } from 'types/Billing';
import { ButtonAction } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeletePaymentMethodActionDef extends TableActionDef {
  action: (
    paymentMethod: BillingPaymentMethod,
    userID: string,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeletePaymentMethodAction extends TableDeleteAction {
  public getActionDef(): TableDeletePaymentMethodActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.DELETE_PAYMENT_METHOD,
      action: this.deletePaymentMethod,
    };
  }

  private deletePaymentMethod(
    paymentMethod: BillingPaymentMethod,
    userID: string,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('settings.billing.payment_methods_delete_title'),
        translateService.instant('settings.billing.payment_methods_delete_confirm', {
          last4: paymentMethod.last4,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.deletePaymentMethod(paymentMethod.id, userID).subscribe({
            next: (response) => {
              spinnerService.hide();
              if (response.succeeded) {
                messageService.showSuccessMessage(
                  translateService.instant('settings.billing.payment_methods_delete_success', {
                    last4: paymentMethod.last4,
                  })
                );
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  messageService,
                  translateService.instant('settings.billing.payment_methods_delete_error')
                );
              }
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                translateService.instant('settings.billing.payment_methods_delete_error')
              );
            },
          });
        }
      });
  }
}
