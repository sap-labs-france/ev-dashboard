import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogParams } from '../../../types/Authorization';
import { PaymentDialogData } from '../../../types/Billing';
import { BillingSettings } from '../../../types/Setting';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { StripeElementComponent } from '../../stripe-element/stripe-element.component';

@Component({
  template: Constants.STRIPE_ELEMENTS ?
    '<app-stripe-element *ngIf="billingSettings?.stripe" #appRef [billingSettings]="billingSettings" [currentUserID]="userID" [inDialog]="true" [dialogRef]="dialogRef"></app-stripe-element>':
    '<app-stripe-payment-method *ngIf="billingSettings?.stripe" #appRef [billingSettings]="billingSettings" [currentUserID]="userID" [inDialog]="true" [dialogRef]="dialogRef"></app-stripe-payment-method>',
})
export class PaymentMethodDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: StripeElementComponent;
  public userID!: string;
  public billingSettings!: BillingSettings;

  public constructor(
    public dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DialogParams<PaymentDialogData>) {
    this.userID = data.dialogData.userId;
    this.billingSettings = data.dialogData.setting;
  }

  public ngAfterViewInit() {
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.linkCardToAccount.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
