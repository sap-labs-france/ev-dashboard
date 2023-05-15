import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SmartChargingDialogData } from 'shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import { ChargingStationsAuthorizations, DialogParamsWithAuth } from 'types/Authorization';

import { Utils } from '../../../utils/Utils';
import { ChargingStationLimitationComponent } from './charging-station-limitation.component';

@Component({
  template:
    '<app-charging-station-limitation #appRef [chargingStationID]="chargingStationID" [chargingStationsAuthorizations]="chargingStationsAuthorizations" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-station-limitation>',
})
export class ChargingStationLimitationDialogComponent {
  @ViewChild('appRef') public appRef!: ChargingStationLimitationComponent;
  public chargingStationID!: string;
  public chargingStationsAuthorizations!: ChargingStationsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationLimitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<SmartChargingDialogData, ChargingStationsAuthorizations>
  ) {
    this.chargingStationID = dialogParams.dialogData?.id as string;
    this.chargingStationsAuthorizations = dialogParams.authorizations;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
