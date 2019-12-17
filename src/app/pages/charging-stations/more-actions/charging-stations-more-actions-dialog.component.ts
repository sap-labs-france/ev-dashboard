import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Charger } from 'app/common.types';

@Component({
  selector: 'app-charging-station-dialog-cmp',
  templateUrl: 'charging-stations-more-actions-dialog.component.html',
})
export class ChargingStationsMoreActionsDialogComponent {
  charger!: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationsMoreActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: Charger) {
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
