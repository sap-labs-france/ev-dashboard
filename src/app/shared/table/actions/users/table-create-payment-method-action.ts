import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BillingButtonAction } from 'types/Billing';

import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';
import { TableCreateAction } from '../table-create-action';

export interface TableCreatePaymentMethodActionDef extends TableActionDef {
  action: (paymentMethodDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreatePaymentMethodAction extends TableCreateAction {
  public getActionDef(): TableCreatePaymentMethodActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.CREATE_PAYMENT_METHOD,
      action: this.createPaymentMethod,
    };
  }

  private createPaymentMethod(paymentMethodDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(paymentMethodDialogComponent, dialog, refresh);
  }
}
