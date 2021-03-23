import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentMethod } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { BillingButtonAction, BillingPaymentMethod } from 'types/Billing';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeletePaymentMethodActionDef extends TableActionDef {
  action: (paymentMethod: BillingPaymentMethod, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableDeletePaymentMethodAction extends TableDeleteAction {
  public getActionDef(): TableDeletePaymentMethodActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.DELETE_PAYMENT_METHOD,
      action: this.deletePaymentMethod,
    };
  }

  // TODO : can we add here "currentUserID" to be sure user doing the deletion is the owner of the card ?
  private deletePaymentMethod(paymentMethod: BillingPaymentMethod, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      paymentMethod, 'settings.billing.payment_methods_delete_title',
      translateService.instant('settings.billing.payment_methods_delete_confirm', { last4: paymentMethod.last4 }),
      translateService.instant('settings.billing.payment_methods_delete_success', { last4: paymentMethod.last4 }),
      'settings.billing.payment_methods_delete_error', centralServerService.deletePaymentMethod.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
