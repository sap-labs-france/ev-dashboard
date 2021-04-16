import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionDialogData } from 'shared/table/actions/transactions/table-view-transaction-action';

import { Utils } from '../../../utils/Utils';

@Component({
  template: `<app-transaction
    [transactionID]="transactionID" [connectorID]="connectorID" [chargingStationID]="chargingStationID"
    [inDialog]="true" [dialogRef]="dialogRef"></app-transaction>`,
})
export class TransactionDialogComponent {
  public transactionID!: number;
  public chargingStationID!: string;
  public connectorID!: number;

  public constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: TransactionDialogData
  ) {
    if (data) {
      this.transactionID = data.transactionID;
      this.chargingStationID = data.chargingStationID;
      this.connectorID = data.connectorID;
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
