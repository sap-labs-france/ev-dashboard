import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { CarConnectorConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { CarConnectorConnectionComponent } from './car-connector-connection.component';

@Component({
  template: '<app-settings-car-connector-connection #appRef [currentCarConnectorConnection]="currentConnection" [dialogRef]="dialogRef"></app-settings-car-connector-connection>',
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
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
