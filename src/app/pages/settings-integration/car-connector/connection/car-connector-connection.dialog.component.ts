import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';

import { CarConnectorConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { CarConnectorConnectionComponent } from './car-connector-connection.component';

@Component({
  template:
    '<app-settings-car-connector-connection #appRef [currentCarConnectorConnection]="currentConnection" [dialogRef]="dialogRef" [dialogMode]="dialogMode"></app-settings-car-connector-connection>',
})
export class CarConnectorConnectionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CarConnectorConnectionComponent;
  public currentConnection!: CarConnectorConnectionSetting;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<CarConnectorConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<CarConnectorConnectionSetting>
  ) {
    this.currentConnection = dialogParams.dialogData;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.save.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
