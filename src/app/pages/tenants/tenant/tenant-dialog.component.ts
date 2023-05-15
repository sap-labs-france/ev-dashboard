import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';
import { Tenant } from 'types/Tenant';

import { Utils } from '../../../utils/Utils';
import { TenantComponent } from './tenant.component';

@Component({
  template:
    '<app-tenant #appRef [currentTenantID]="tenantID" [inDialog]="true" [dialogRef]="dialogRef"></app-tenant>',
})
export class TenantDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TenantComponent;
  public tenantID!: string;

  public constructor(
    public dialogRef: MatDialogRef<TenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Tenant>
  ) {
    this.tenantID = dialogParams.dialogData?.id;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveTenant.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
