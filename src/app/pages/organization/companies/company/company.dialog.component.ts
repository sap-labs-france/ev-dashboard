import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-company [currentCompanyID]="companyID" [inDialog]="true" [dialogRef]="dialogRef"></app-company>',
})
export class CompanyDialogComponent {
  public companyID!: string;

  constructor(
    public dialogRef: MatDialogRef<CompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.companyID = data;
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
