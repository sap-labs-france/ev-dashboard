import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';
import { Utils } from 'app/utils/Utils';

import { ChargingStationChargingLimitComponent } from './charging-station-charging-limit.component';

@Component({
  template: '<app-charging-station-charging-limit #appRef [chargingStation]="chargingStation" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-station-charging-limit>',
})
export class ChargingStationChargingLimitDialogComponent {
  @ViewChild('appRef') public appRef!: ChargingStationChargingLimitComponent;
  public chargingStation!: ChargingStation;

  constructor(
    public dialogRef: MatDialogRef<ChargingStationChargingLimitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ChargingStation) {
    this.chargingStation = data;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
