import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { Tenant } from 'types/Tenant';

import { Utils } from '../../../utils/Utils';
import { TenantComponent } from './tenant.component';

@Component({
  template: '<app-tenant #appRef [dialogMode]="dialogMode" [currentTenantID]="tenantID" [inDialog]="true" [dialogRef]="dialogRef"></app-tenant>',
})
export class TenantDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TenantComponent;
  public tenantID!: string;
  public dialogMode: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<TenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Tenant>) {
    this.tenantID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTenant.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
