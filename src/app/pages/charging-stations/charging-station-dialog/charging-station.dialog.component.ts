import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Charger } from "../../../common.types";
//import 'rxjs/add/operator/mergeMap';

@Component({
  selector: 'app-charging-station-dialog-cmp',
  templateUrl: 'charging-station.dialog.component.html'
})
export class ChargingStationDialogComponent {
   chargeBox: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.chargeBox = data;
    }
  }
}
