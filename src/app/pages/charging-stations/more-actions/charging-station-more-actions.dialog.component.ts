import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Charger } from 'app/common.types';

@Component({
  selector: 'app-charging-station-dialog-cmp',
  templateUrl: 'charging-station-more-actions.dialog.component.html'
})
export class ChargingStationMoreActionsDialogComponent {
  charger: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationMoreActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

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
