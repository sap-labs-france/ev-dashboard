import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData, DialogParams } from 'types/Authorization';
import { BillingButtonAction } from 'types/Billing';
import { ScreenSize } from 'types/GlobalType';

import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface BillingInvoiceDialogData extends DialogData {
  invoiceID: number;
  currentUserID: string;
}
export interface TableViewBillingInvoiceActionDef extends TableActionDef {
  action: (invoiceDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<BillingInvoiceDialogData>, refresh?: () => Observable<void>) => void;
}

export class TableViewBillingInvoiceAction extends TableViewAction {
  public getActionDef(): TableViewBillingInvoiceActionDef {
    return {
      ...super.getActionDef(),
      id: BillingButtonAction.VIEW_INVOICE,
      action: this.viewBillingInvoice,
    };
  }

  private viewBillingInvoice(invoiceDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<BillingInvoiceDialogData>, refresh?: () => Observable<void>) {
    super.view(invoiceDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.S,
      maxWidth: ScreenSize.M,
      width: ScreenSize.M,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XXL
    });
  }
}
