import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `<app-transaction
    [transactionID]="transactionID" [connectorID]="connectorID" [chargingStationID]="chargingStationID" 
    [inDialog]="true" [dialogRef]="dialogRef"></app-transaction>`,
})
export class TransactionDialogComponent {
  public transactionID!: number;
  public chargingStationID!: string;
  public connectorID!: number;

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: number|{ transactionID: number; chargingStationID: string, connectorID: number; }) {
    if (data) {
      if (typeof data === 'object') {
        this.transactionID = data.transactionID;
        this.chargingStationID = data.chargingStationID;
        this.connectorID = data.connectorID;
      } else {
        this.transactionID = data;
      }
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
