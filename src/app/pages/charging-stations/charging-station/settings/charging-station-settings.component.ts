import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Charger } from 'app/common.types';

@Component({
  selector: 'app-charging-station-settings',
  templateUrl: 'charging-station-settings.component.html',
})
export class ChargingStationSettingsComponent {
  chargeBox: Charger;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.chargeBox = data;
    }
  }
}
