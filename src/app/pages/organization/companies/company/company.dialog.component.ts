import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogAuthorization } from 'types/Authorization';

import { Utils } from '../../../../utils/Utils';
import { CompanyComponent } from './company.component';

@Component({
  template: '<app-company #appRef [currentCompanyID]="companyID" [canCreateCompany]="canCreateCompany" [canUpdateCompany]="canUpdateCompany" [inDialog]="true" [dialogRef]="dialogRef"></app-company>',
})
export class CompanyDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: CompanyComponent;
  public companyID!: string;
  public canCreateCompany: boolean;
  public canUpdateCompany: boolean;

  public constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogAuthorization | string) {
    if (typeof data !== 'string') {
      if (data.id) {
        // edit mode
        this.companyID = data.id;
        this.canUpdateCompany = data.authorizations.canUpdate;
      } else {
        // create mode
        this.canCreateCompany = data.authorizations.canCreate;
      }
    } else {
      // view mode
      this.companyID = data;
    }
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveCompany.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
