import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { Company } from 'types/Company';

import { Utils } from '../../../../utils/Utils';
import { CompanyComponent } from './company.component';

@Component({
  template: '<app-company #appRef [currentCompanyID]="companyID" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-company>',
})
export class CompanyDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CompanyComponent;
  public companyID!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Company>) {
    this.companyID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveCompany.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
