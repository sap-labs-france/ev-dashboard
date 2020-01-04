import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-dialog-cmp',
  templateUrl: 'charging-stations-more-actions-dialog.component.html',
})
export class ChargingStationsMoreActionsDialogComponent {
  charger!: ChargingStation;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationsMoreActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ChargingStation) {
    this.charger = data;
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
