import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RegistrationToken } from '../../../../types/RegistrationToken';
import { ChargingStationsRegistrationTokenComponent } from './charging-stations-registration-token.component';

@Component({
  template: '<app-charging-stations-registration-token #appRef [currentToken]="currentToken" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-stations-registration-token>',
})
export class ChargingStationsRegistrationTokenDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationsRegistrationTokenComponent;
  public currentToken!: RegistrationToken;

  constructor(
    public dialogRef: MatDialogRef<ChargingStationsRegistrationTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: RegistrationToken) {
    this.currentToken = data;
  }

  public ngAfterViewInit() {
    // TODO: Escape key already closes the pop-up! Need to check how!?
    // // Register key event
    // Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
    //   this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}

