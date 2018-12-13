import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Charger } from "../../../common.types";

@Component({
  selector: 'app-charging-station-actions-dialog-cmp',
  templateUrl: 'charging-station-actions.dialog.component.html'
})
export class ChargingStationActionsDialogComponent {
   charger: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.charger = data;
    }
  }
}
