import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../../utils/Utils';
import { CompanyComponent } from './company.component';

@Component({
  template: '<app-company #appRef [currentCompanyID]="companyID" [inDialog]="true" [dialogRef]="dialogRef"></app-company>',
})
export class CompanyDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CompanyComponent;
  public companyID!: string;

  constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.companyID = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveCompany.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
