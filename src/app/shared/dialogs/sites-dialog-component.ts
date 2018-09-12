import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  templateUrl: './sites-dialog-component.html'
})
export class SitesDialogComponent {
  constructor(
      private dialogRef: MatDialogRef<SitesDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    console.log('====================================');
    console.log(data);
    console.log('====================================');
  }

  save() {
    this.dialogRef.close('Return Value');
  }

  close() {
    this.dialogRef.close();
  }
}
