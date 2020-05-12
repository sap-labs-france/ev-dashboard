import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-charging-station [chargingStationID]="chargingStationID" ></app-charging-station>',
})
export class ChargingStationDialogComponent {
  public chargingStationID!: string;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.chargingStationID = data;
  }
}
