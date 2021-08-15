import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SmartChargingDialogData } from 'shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import { DialogParams } from 'types/Authorization';

import { Utils } from '../../../utils/Utils';
import { ChargingStationLimitationComponent } from './charging-station-limitation.component';

@Component({
  template: '<app-charging-station-limitation #appRef [chargingStationID]="chargingStationID" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-station-limitation>',
})
export class ChargingStationLimitationDialogComponent {
  @ViewChild('appRef') public appRef!: ChargingStationLimitationComponent;
  public chargingStationID!: string;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationLimitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<SmartChargingDialogData>) {
    this.chargingStationID = dialogParams.dialogData?.id as string;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
