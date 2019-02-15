import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Constants} from '../../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './confirmation-dialog-component.html',
  styleUrls: ['../dialogs.component.scss'],
})
export class ConfirmationDialogComponent {
  public title = '';
  public message = '';
  public buttonValidateName = '';
  public buttonCancelName = '';
  public buttonValidateID = '';
  public buttonCancelID = '';

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // Set
    this.title = data.title;
    this.message = data.message;
    // set name
    switch (data.dialogType) {
      // Ok / Cancel
      case Constants.DIALOG_TYPE_OK_CANCEL:
        this.buttonValidateID = Constants.BUTTON_TYPE_OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonCancelID = Constants.BUTTON_TYPE_CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        break;

      // Yes / No
      case Constants.DIALOG_TYPE_YES_NO:
        this.buttonValidateID = Constants.BUTTON_TYPE_YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonCancelID = Constants.BUTTON_TYPE_NO;
        this.buttonCancelName = this.translateService.instant('general.no');
        break;

      case Constants.DIALOG_TYPE_OK:
        this.buttonValidateID = Constants.BUTTON_TYPE_OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        break;
    }
  }

  valdate() {
    this.dialogRef.close(this.buttonValidateID);
  }

  cancel() {
    this.dialogRef.close(this.buttonCancelID);
  }
}
