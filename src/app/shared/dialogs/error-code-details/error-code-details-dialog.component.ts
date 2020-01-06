import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorMessage } from 'app/types/InError';

@Component({
  templateUrl: './error-code-details-dialog.component.html',
})
export class ErrorCodeDetailsDialogComponent {
  error!: ErrorMessage;

  constructor(
    protected dialogRef: MatDialogRef<ErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    if (data) {
      this.error = data;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
