/* eslint-disable max-len */
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData } from 'types/Authorization';
import { BillingButtonAction } from 'types/Billing';

import { BillingSettings } from '../../../../types/Setting';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface PaymentDialogData extends DialogData {
  userId: string;
  setting: BillingSettings;
}

export interface TableCreatePaymentMethodActionDef extends TableActionDef {
  action: (paymentMethodDialogComponent: ComponentType<unknown>, dialog: MatDialog, data: PaymentDialogData, 
    refresh?: () => Observable<void>) => void;
}

export class TableCreatePaymentMethodAction extends TableCreateAction {
  public getActionDef(): TableCreatePaymentMethodActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.CREATE_PAYMENT_METHOD,
      action: this.createPaymentMethod,
    };
  }

  private createPaymentMethod(paymentMethodDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, data: PaymentDialogData, refresh?: () => Observable<void>) {
    super.create(paymentMethodDialogComponent, dialog, data, refresh);
  }
}
