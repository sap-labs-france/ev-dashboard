import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Charger } from "../../../../common.types";

@Component({
  selector: 'app-smart-charging-dialog-cmp',
  templateUrl: 'smart-charging.dialog.component.html'
})
export class ChargingStationSmartChargingDialogComponent {
   charger: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSmartChargingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.charger = data;
    }
  }
}
