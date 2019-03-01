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
  public buttonValidateID = '';
  public buttonValidateName = '';
  public buttonNoID = '';
  public buttonNoName = '';
  public buttonCancelID = '';
  public buttonCancelName = '';


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
        this.buttonNoID = null;
        this.buttonNoName = null;
        break;

      // Yes / No
      case Constants.DIALOG_TYPE_YES_NO:
        this.buttonValidateID = Constants.BUTTON_TYPE_YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = Constants.BUTTON_TYPE_NO;
        this.buttonNoName = this.translateService.instant('general.no');
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        break;
      // Yes
      case Constants.DIALOG_TYPE_OK:
        this.buttonValidateID = Constants.BUTTON_TYPE_OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonNoID = null;
        this.buttonNoName = null;
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        break;
      // Yes / No / Cancel
      case Constants.DIALOG_TYPE_YES_NO_CANCEL:
      this.buttonValidateID = Constants.BUTTON_TYPE_YES;
      this.buttonValidateName = this.translateService.instant('general.yes');
      this.buttonNoID = Constants.BUTTON_TYPE_NO;
      this.buttonNoName = this.translateService.instant('general.no');
      this.buttonCancelID = Constants.BUTTON_TYPE_CANCEL;
      this.buttonCancelName = this.translateService.instant('general.cancel');
      break;
    }
  }

  validate() {
    this.dialogRef.close(this.buttonValidateID);
  }

  no() {
    this.dialogRef.close(this.buttonNoID);
  }

  cancel() {
    this.dialogRef.close(this.buttonCancelID);
  }


}
