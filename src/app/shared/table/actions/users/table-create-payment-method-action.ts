/* eslint-disable max-len */
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { BillingButtonAction, PaymentDialogData } from '../../../../types/Billing';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreatePaymentMethodActionDef extends TableActionDef {
  action: (
    paymentMethodDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PaymentDialogData>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableCreatePaymentMethodAction extends TableCreateAction {
  public getActionDef(): TableCreatePaymentMethodActionDef {
    return {
      ...super.getActionDef(),
      icon: 'add',
      name: 'general.add',
      tooltip: 'general.tooltips.add',
      id: BillingButtonAction.CREATE_PAYMENT_METHOD,
      action: this.createPaymentMethod,
    };
  }

  private createPaymentMethod(
    paymentMethodDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PaymentDialogData>,
    refresh?: () => Observable<void>
  ) {
    super.create(paymentMethodDialogComponent, dialog, dialogParams, refresh);
  }
}
