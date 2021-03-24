import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CarConnectorConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { CarConnectorConnectionComponent } from './car-connector-connection.component';

@Component({
  template: '<app-settings-car-connector-connection #appRef [currentCarConnectorConnection]="currentConnection" [inDialog]="true" [dialogRef]="dialogRef"></app-settings-car-connector-connection>',
})
export class CarConnectorConnectionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CarConnectorConnectionComponent;
  public currentConnection!: CarConnectorConnectionSetting;

  public constructor(
    public dialogRef: MatDialogRef<CarConnectorConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: CarConnectorConnectionSetting) {
    this.currentConnection = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.setConnectionAndClose.bind(this.appRef), this.appRef.cancel.bind(this.appRef));
  }
}
