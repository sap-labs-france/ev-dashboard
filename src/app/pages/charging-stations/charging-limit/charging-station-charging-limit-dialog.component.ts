import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Charger } from 'app/common.types';

@Component({
  selector: 'app-charging-station-smart-charging-dialog',
  templateUrl: 'charging-station-charging-limit-dialog.component.html',
})
export class ChargingStationSmartChargingDialogComponent {
  charger!: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSmartChargingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: Charger) {
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
