import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-settings',
  templateUrl: 'charging-station-settings.component.html',
})
export class ChargingStationSettingsComponent {
  chargeBox!: ChargingStation;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {

    if (data) {
      this.chargeBox = data;
    }
  }
}
