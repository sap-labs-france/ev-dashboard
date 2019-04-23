import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Constants} from '../../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './confirmation-dialog-component.html'
})
export class ConfirmationDialogComponent {
  public title = '';
  public message = '';
  public buttonValidateID = '';
  public buttonValidateName = '';
  public buttonValidateColor = 'primary';
  public buttonNoID = '';
  public buttonNoColor = '';
  public buttonNoName = '';
  public buttonCancelID = '';
  public buttonCancelName = '';
  private canCancelDialog = false;

  constructor(
      private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
      private translateService: TranslateService,
      @Inject(MAT_DIALOG_DATA) data) {
    // Decal cancel dialog
    setTimeout(() => this.canCancelDialog = true, 250);
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
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = '';
        break;

      // Yes / No
      case Constants.DIALOG_TYPE_YES_NO:
        this.buttonValidateID = Constants.BUTTON_TYPE_YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = Constants.BUTTON_TYPE_NO;
        this.buttonNoName = this.translateService.instant('general.no');
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        this.buttonValidateColor = 'warn';
        this.buttonNoColor = '';
        break;
      // Yes
      case Constants.DIALOG_TYPE_OK:
        this.buttonValidateID = Constants.BUTTON_TYPE_OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonNoID = null;
        this.buttonNoName = null;
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = '';
        break;
      // Yes / No / Cancel
      case Constants.DIALOG_TYPE_YES_NO_CANCEL:
        this.buttonValidateID = Constants.BUTTON_TYPE_YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = Constants.BUTTON_TYPE_NO;
        this.buttonNoName = this.translateService.instant('general.no');
        this.buttonCancelID = Constants.BUTTON_TYPE_CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = 'warn';
        this.buttonNoColor = 'primary';
        break;
      // Save and Close / Do Not Save and Close / Cancel
      case Constants.DIALOG_TYPE_DIRTY_CHANGE:
        this.buttonValidateID = Constants.BUTTON_TYPE_SAVE_AND_CLOSE;
        this.buttonValidateName = this.translateService.instant('general.save_and_close');
        this.buttonNoID = Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE;
        this.buttonNoName = this.translateService.instant('general.do_not_save_and_close');
        this.buttonCancelID = Constants.BUTTON_TYPE_CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = 'warn';
        break;
      // Do Not Save and Close / Cancel
      case Constants.DIALOG_TYPE_INVALID_CHANGE:
        this.buttonValidateID = null;
        this.buttonValidateName = null;
        this.buttonNoID = Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE;
        this.buttonNoName = this.translateService.instant('general.do_not_save_and_close');
        this.buttonCancelID = Constants.BUTTON_TYPE_CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = '';
        this.buttonNoColor = 'warn';
        break;
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onEscape();
      }
      // check if enter
      if (keydownEvents && keydownEvents.code === 'Enter') {
        this.onEnter();
      }
    });
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

  onEnter() {
    if (this.buttonValidateName === null) {
      this.no();
    } else {
      this.validate();
    }
  }

  onEscape() {
    if (!this.canCancelDialog) {
      return;
    }
    if (this.buttonCancelName === null) {
      if (this.buttonNoName === null) {
        this.validate();
      } else {
        this.no();
      }
    } else {
      this.cancel();
    }
  }

}
