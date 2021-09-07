import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';
import { BillingInvoice } from 'types/Billing';

import { Utils } from '../../../utils/Utils';
import { InvoiceComponent } from './invoice.component';

@Component({
  template: '<app-invoice #appRef [currentInvoiceID]="invoiceID" [currentUserID]="userID" [inDialog]="true" [dialogRef]="dialogRef"></app-invoice>',
})
export class InvoiceDialogComponent implements AfterViewInit{
  @ViewChild('appRef') public appRef!: InvoiceComponent;
  public invoiceID!: string;
  public inDialog!: boolean;
  public userID!: string;

  public constructor(
    public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DialogParams<BillingInvoice>) {
    this.invoiceID = data.dialogData?.id;
    this.userID = data.dialogData?.currentUserID;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
