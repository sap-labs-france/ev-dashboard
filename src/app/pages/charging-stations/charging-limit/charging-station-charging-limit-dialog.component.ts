import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-smart-charging-dialog',
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
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
