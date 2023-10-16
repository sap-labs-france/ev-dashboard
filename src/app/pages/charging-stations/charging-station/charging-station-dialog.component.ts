import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ChargingStationsAuthorizations,
  DialogMode,
  DialogParamsWithAuth,
} from 'types/Authorization';
import { ChargingStation } from 'types/ChargingStation';

import { Utils } from '../../../utils/Utils';
import { ChargingStationComponent } from './charging-station.component';

@Component({
  template:
    '<app-charging-station #appRef [chargingStationID]="chargingStationID" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [chargingStationsAuthorizations]="chargingStationsAuthorizations" ></app-charging-station>',
})
export class ChargingStationDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationComponent;
  public chargingStationID!: string;
  public dialogMode!: DialogMode;
  public chargingStationsAuthorizations!: ChargingStationsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<ChargingStation, ChargingStationsAuthorizations>
  ) {
    this.chargingStationID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.chargingStationsAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveChargingStation.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
