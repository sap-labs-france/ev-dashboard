import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error-code-details-dialog.component.html',
})
export class ErrorCodeDetailsDialogComponent {
  error: ErrorMessage;

  constructor(
    protected dialogRef: MatDialogRef<ErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.error = data;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

export class ErrorMessage {
  constructor(
    public title: string,
    public titleParameters: any = {},
    public description: string,
    public descriptionParameters: any = {},
    public action: string,
    public actionParameters: any = {}) {
  }
}
