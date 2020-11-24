import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../utils/Utils';
import { ChargingStationLimitationComponent } from './charging-station-limitation.component';

@Component({
  template: '<app-charging-station-limitation #appRef [chargingStationID]="chargingStationID" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-station-limitation>',
})
export class ChargingStationLimitationDialogComponent {
  @ViewChild('appRef') public appRef!: ChargingStationLimitationComponent;
  public chargingStationID!: string;

  constructor(
    public dialogRef: MatDialogRef<ChargingStationLimitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.chargingStationID = data;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
