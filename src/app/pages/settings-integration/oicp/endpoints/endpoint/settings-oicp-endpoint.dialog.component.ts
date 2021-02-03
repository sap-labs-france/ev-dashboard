import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';
import { Utils } from '../../../../../utils/Utils';
import { SettingsOicpEndpointComponent } from './settings-oicp-endpoint.component';

@Component({
  template: '<app-oicp-endpoint #appRef [currentEndpoint]="currentEndpoint" [inDialog]="true" [dialogRef]="dialogRef"></app-oicp-endpoint>',
})
export class SettingsOicpEnpointDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SettingsOicpEndpointComponent;
  public currentEndpoint!: OicpEndpoint;

  constructor(
    public dialogRef: MatDialogRef<SettingsOicpEnpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: OicpEndpoint) {
    // Check if data is passed to the dialog
    this.currentEndpoint = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
