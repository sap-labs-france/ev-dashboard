import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Constants} from '../../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';

export const BUTTON_FOR_MYSELF = 'FOR_MYSELF';
export const BUTTON_SELECT_USER = 'SELECT_USER';

@Component({
  templateUrl: './start-transaction-dialog-component.html',
  styleUrls: ['../../../shared/dialogs/dialogs.component.scss'],
})
export class StartTransactionDialogComponent {
  public title = '';
  public message = '';

  constructor(
    private dialogRef: MatDialogRef<StartTransactionDialogComponent>,
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
