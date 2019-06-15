import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-company-dialog-cmp',
  template: '<app-company-cmp [currentCompanyID]="companyID" [inDialog]="true" [dialogRef]="dialogRef"></app-company-cmp>'
})
export class CompanyDialogComponent {
  companyID: string;

  constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.companyID = data;
    }

  }
}
