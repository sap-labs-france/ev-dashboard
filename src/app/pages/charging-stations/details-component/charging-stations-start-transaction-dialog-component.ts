import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BUTTON_FOR_MYSELF, BUTTON_SELECT_USER } from '../../../shared/table/actions/charging-stations/table-charging-stations-start-transaction-action';
import { ButtonType } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: './charging-stations-start-transaction-dialog-component.html',
})
export class ChargingStationsStartTransactionDialogComponent {
  public title = '';
  public message = '';

  constructor(
    private dialogRef: MatDialogRef<ChargingStationsStartTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Set
    this.title = data.title;
    this.message = data.message;
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public forMyself() {
    this.dialogRef.close(BUTTON_FOR_MYSELF);
  }

  public selectUser() {
    this.dialogRef.close(BUTTON_SELECT_USER);
  }

  public cancel() {
    this.dialogRef.close(ButtonType.CANCEL);
  }
}
