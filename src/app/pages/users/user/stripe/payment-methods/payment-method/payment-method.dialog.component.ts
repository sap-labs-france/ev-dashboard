import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../../../../utils/Utils';
import { PaymentMethodComponent } from './payment-method.component';

@Component({
  template: '<app-payment-method #appRef [currentUserID]="userID" [inDialog]="true" [dialogRef]="dialogRef"></app-payment-method>',
})
export class PaymentMethodDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: PaymentMethodComponent;
  public userID!: string;

  public constructor(
    public dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.userID = data;
  }

  public ngAfterViewInit() {
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.linkCardToAccount.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}

