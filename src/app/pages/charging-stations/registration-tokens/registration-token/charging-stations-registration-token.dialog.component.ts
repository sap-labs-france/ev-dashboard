import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../../utils/Utils';
import { ChargingStationsRegistrationTokenComponent } from './charging-stations-registration-token.component';

@Component({
  template: '<app-charging-stations-registration-token #appRef [currentTokenID]="currentTokenID" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-stations-registration-token>',
})
export class ChargingStationsRegistrationTokenDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationsRegistrationTokenComponent;
  public currentTokenID!: string;

  constructor(
    public dialogRef: MatDialogRef<ChargingStationsRegistrationTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.currentTokenID = data;
  }

  public ngAfterViewInit() {
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}

