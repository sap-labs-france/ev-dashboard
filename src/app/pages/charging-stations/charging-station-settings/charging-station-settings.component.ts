import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Charger } from '../../../common.types';

@Component({
  selector: 'app-charging-station-settings-cmp',
  templateUrl: 'charging-station-settings.component.html'
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
