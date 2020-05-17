import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';

@Component({
  templateUrl: 'charging-station-charging-limit-dialog.component.html',
})
export class ChargingStationSmartChargingDialogComponent {
  public charger!: ChargingStation;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSmartChargingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ChargingStation) {
    if (data) {
      this.charger = data;
    }
  }

  public close() {
    // TODO: To implement
  }
}
