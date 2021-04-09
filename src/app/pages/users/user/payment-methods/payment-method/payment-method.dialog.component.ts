import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentDialogData } from 'shared/table/actions/users/table-create-payment-method-action';
import { BillingSettings } from 'types/Setting';

import { Utils } from '../../../../../utils/Utils';
import { PaymentMethodComponent } from './stripe/payment-method.component';

@Component({
  template: '<app-payment-method *ngIf="billingSettings?.stripe" #appRef [billingSettings]="billingSettings" [currentUserID]="userID" [inDialog]="true" [dialogRef]="dialogRef"></app-payment-method>',
})
export class PaymentMethodDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: PaymentMethodComponent;
  public userID!: string;
  public billingSettings!: BillingSettings;

  public constructor(
    public dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: PaymentDialogData) {
    this.userID = data.userId;
    this.billingSettings = data.setting;
  }

  public ngAfterViewInit() {
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.linkCardToAccount.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}

