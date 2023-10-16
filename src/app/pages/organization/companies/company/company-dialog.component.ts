import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompaniesAuthorizations, DialogMode, DialogParamsWithAuth } from 'types/Authorization';
import { Company } from 'types/Company';

import { Utils } from '../../../../utils/Utils';
import { CompanyComponent } from './company.component';

@Component({
  template:
    '<app-company #appRef [currentCompanyID]="companyID" [companiesAuthorizations]="companiesAuthorizations" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-company>',
})
export class CompanyDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CompanyComponent;
  public companyID!: string;
  public dialogMode!: DialogMode;
  public companiesAuthorizations!: CompaniesAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Company, CompaniesAuthorizations>
  ) {
    this.companyID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.companiesAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveCompany.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
