import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OcpiEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { Utils } from '../../../../../utils/Utils';
import { SettingsOcpiEnpointComponent } from './settings-ocpi-endpoint.component';

@Component({
  template: '<app-ocpi-endpoint #appRef [currentEndpoint]="currentEndpoint" [inDialog]="true" [dialogRef]="dialogRef"></app-ocpi-endpoint>',
})
export class SettingsOcpiEnpointDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SettingsOcpiEnpointComponent;
  public currentEndpoint!: OcpiEndpoint;

  constructor(
    public dialogRef: MatDialogRef<SettingsOcpiEnpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: OcpiEndpoint) {
    // Check if data is passed to the dialog
    this.currentEndpoint = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
