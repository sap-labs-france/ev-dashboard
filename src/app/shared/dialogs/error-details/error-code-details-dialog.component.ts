import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error-code-details.dialog.component.html',
})
export class ErrorCodeDetailsDialogComponent implements OnInit {
  error: ErrorMessage;

  constructor(
    protected dialogRef: MatDialogRef<ErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.error = data;
    }
  }

  ngOnInit(): void {
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
