import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  DialogMode,
  DialogParamsWithAuth,
  OcpiEndpointsAuthorizations,
} from '../../../../../types/Authorization';
import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { Utils } from '../../../../../utils/Utils';
import { SettingsOcpiEndpointComponent } from './settings-ocpi-endpoint.component';

@Component({
  template:
    '<app-ocpi-endpoint #appRef [currentEndpoint]="currentEndpoint" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [authorizations]="authorizations"></app-ocpi-endpoint>',
})
export class SettingsOcpiEndpointDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SettingsOcpiEndpointComponent;
  public currentEndpoint!: OCPIEndpoint;
  public dialogMode!: DialogMode;
  public authorizations!: OcpiEndpointsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<SettingsOcpiEndpointDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<OCPIEndpoint, OcpiEndpointsAuthorizations>
  ) {
    this.currentEndpoint = dialogParams.dialogData;
    this.dialogMode = dialogParams.dialogMode;
    this.authorizations = dialogParams.authorizations;
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
