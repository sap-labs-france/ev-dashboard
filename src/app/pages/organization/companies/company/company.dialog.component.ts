import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-company-dialog-cmp',
  templateUrl: 'company.dialog.component.html'
})
export class CompanyDialogComponent {
  companyID: string;

  constructor(
    private dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.companyID = data;
    }
  }
}
