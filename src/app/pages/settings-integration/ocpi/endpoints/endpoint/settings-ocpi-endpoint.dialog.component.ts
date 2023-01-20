import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { Utils } from '../../../../../utils/Utils';
import { SettingsOcpiEndpointComponent } from './settings-ocpi-endpoint.component';

@Component({
  template: '<app-ocpi-endpoint #appRef [currentEndpoint]="currentEndpoint" [dialogRef]="dialogRef"></app-ocpi-endpoint>',
})
export class SettingsOcpiEndpointDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SettingsOcpiEndpointComponent;
  public currentEndpoint!: OCPIEndpoint;

  public constructor(
    public dialogRef: MatDialogRef<SettingsOcpiEndpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: OCPIEndpoint) {
    // Check if data is passed to the dialog
    this.currentEndpoint = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
