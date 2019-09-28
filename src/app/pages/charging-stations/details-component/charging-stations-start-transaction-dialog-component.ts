import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../../utils/Constants';

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
    @Inject(MAT_DIALOG_DATA) data) {
    // Set
    this.title = data.title;
    this.message = data.message;
  }

  forMyself() {
    this.dialogRef.close(BUTTON_FOR_MYSELF);
  }

  selectUser() {
    this.dialogRef.close(BUTTON_SELECT_USER);
  }

  cancel() {
    this.dialogRef.close(Constants.BUTTON_TYPE_CANCEL);
  }
}
