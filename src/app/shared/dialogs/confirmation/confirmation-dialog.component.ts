import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ButtonType, DialogType } from 'app/types/Table';

@Component({
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements AfterViewInit {
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
      protected dialogRef: MatDialogRef<ConfirmationDialogComponent>,
      protected translateService: TranslateService,
      @Inject(MAT_DIALOG_DATA) data) {
    // Set
    this.title = data.title;
    this.message = data.message;
    // Listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.key === 'Escape') {
        this.onEscape();
      }
      // check if enter
      if (keydownEvents && keydownEvents.key === 'Enter') {
        this.onEnter();
      }
    });
    // set name
    switch (data.dialogType) {
      // Ok / Cancel
      case DialogType.OK_CANCEL:
        this.buttonValidateID = ButtonType.OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonCancelID = ButtonType.CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonNoID = null;
        this.buttonNoName = null;
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = '';
        break;

      // Yes / No
      case DialogType.YES_NO:
        this.buttonValidateID = ButtonType.YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = ButtonType.NO;
        this.buttonNoName = this.translateService.instant('general.no');
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        this.buttonValidateColor = 'warn';
        this.buttonNoColor = '';
        break;
      // Yes
      case DialogType.OK:
        this.buttonValidateID = ButtonType.OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonNoID = null;
        this.buttonNoName = null;
        this.buttonCancelID = null;
        this.buttonCancelName = null;
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = '';
        break;
      // Yes / No / Cancel
      case DialogType.YES_NO_CANCEL:
        this.buttonValidateID = ButtonType.YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = ButtonType.NO;
        this.buttonNoName = this.translateService.instant('general.no');
        this.buttonCancelID = ButtonType.CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = 'warn';
        this.buttonNoColor = 'primary';
        break;
      // Save and Close / Do Not Save and Close / Cancel
      case DialogType.DIRTY_CHANGE:
        this.buttonValidateID = ButtonType.SAVE_AND_CLOSE;
        this.buttonValidateName = this.translateService.instant('general.save_and_close');
        this.buttonNoID = ButtonType.DO_NOT_SAVE_AND_CLOSE;
        this.buttonNoName = this.translateService.instant('general.do_not_save_and_close');
        this.buttonCancelID = ButtonType.CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = 'warn';
        break;
      // Do Not Save and Close / Cancel
      case DialogType.INVALID_CHANGE:
        this.buttonValidateID = null;
        this.buttonValidateName = null;
        this.buttonNoID = ButtonType.DO_NOT_SAVE_AND_CLOSE;
        this.buttonNoName = this.translateService.instant('general.do_not_save_and_close');
        this.buttonCancelID = ButtonType.CANCEL;
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

  ngAfterViewInit() {
    this.canCancelDialog = true;
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
