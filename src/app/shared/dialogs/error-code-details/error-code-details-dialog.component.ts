import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ErrorMessage } from '../../../types/InError';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'error-code-details-dialog.component.html',
})
export class ErrorCodeDetailsDialogComponent {
  public error!: ErrorMessage;

  public constructor(
    protected dialogRef: MatDialogRef<ErrorCodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.error = data;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
