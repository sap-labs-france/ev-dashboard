import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-settings',
  templateUrl: 'charging-station-settings.component.html',
})
export class ChargingStationSettingsComponent {
  public chargeBox!: ChargingStation;

  constructor(
    private dialogRef: MatDialogRef<ChargingStationSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {

    if (data) {
      this.chargeBox = data;
    }
  }
}
