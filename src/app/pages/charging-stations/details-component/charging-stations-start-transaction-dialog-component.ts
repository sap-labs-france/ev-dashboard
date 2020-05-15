import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ButtonType } from 'app/types/Table';

export const BUTTON_FOR_MYSELF = 'FOR_MYSELF';
export const BUTTON_SELECT_USER = 'SELECT_USER';

@Component({
  templateUrl: './charging-stations-start-transaction-dialog-component.html',
})
export class ChargingStationsStartTransactionDialogComponent {
  public title = '';
  public message = '';

  constructor(
    private dialogRef: MatDialogRef<ChargingStationsStartTransactionDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Set
    this.title = data.title;
    this.message = data.message;
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
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
