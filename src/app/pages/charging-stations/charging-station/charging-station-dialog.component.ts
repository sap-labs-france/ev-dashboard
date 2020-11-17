import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../utils/Utils';
import { ChargingStationComponent } from './charging-station.component';

@Component({
  template: '<app-charging-station #appRef [chargingStationID]="chargingStationID" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-station>',
})
export class ChargingStationDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationComponent;
  public chargingStationID!: string;

  constructor(
    public dialogRef: MatDialogRef<ChargingStationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.chargingStationID = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveChargingStation.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
