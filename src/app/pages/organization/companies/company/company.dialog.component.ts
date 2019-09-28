import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-company [currentCompanyID]="companyID" [inDialog]="true" [dialogRef]="dialogRef"></app-company>',
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
