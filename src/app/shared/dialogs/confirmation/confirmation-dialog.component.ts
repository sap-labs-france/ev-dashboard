import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ButtonType, DialogType } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';

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
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Set
    this.title = data.title;
    this.message = data.message;
    Utils.registerValidateCloseKeyEvents(this.dialogRef,
      this.onEnter.bind(this), this.onEscape.bind(this));
    // set name
    switch (data.dialogType) {
      // Ok / Cancel
      case DialogType.OK_CANCEL:
        this.buttonValidateID = ButtonType.OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        this.buttonCancelID = ButtonType.CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        delete this.buttonNoID;
        delete this.buttonNoName;
        this.buttonValidateColor = 'primary';
        this.buttonNoColor = '';
        break;

      // Yes / No
      case DialogType.YES_NO:
        this.buttonValidateID = ButtonType.YES;
        this.buttonValidateName = this.translateService.instant('general.yes');
        this.buttonNoID = ButtonType.NO;
        this.buttonNoName = this.translateService.instant('general.no');
        delete this.buttonCancelID;
        delete this.buttonCancelName;
        this.buttonValidateColor = 'warn';
        this.buttonNoColor = '';
        break;
      // Yes
      case DialogType.OK:
        this.buttonValidateID = ButtonType.OK;
        this.buttonValidateName = this.translateService.instant('general.ok');
        delete this.buttonNoID;
        delete this.buttonNoName;
        delete this.buttonCancelID;
        delete this.buttonCancelName;
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
        delete this.buttonValidateID;
        delete this.buttonValidateName;
        this.buttonNoID = ButtonType.DO_NOT_SAVE_AND_CLOSE;
        this.buttonNoName = this.translateService.instant('general.do_not_save_and_close');
        this.buttonCancelID = ButtonType.CANCEL;
        this.buttonCancelName = this.translateService.instant('general.cancel');
        this.buttonValidateColor = '';
        this.buttonNoColor = 'warn';
        break;
    }
    Utils.registerValidateCloseKeyEvents(this.dialogRef,
      this.onEnter.bind(this), this.onEscape.bind(this));
  }

  public ngAfterViewInit() {
    this.canCancelDialog = true;
  }

  public validate() {
    this.dialogRef.close(this.buttonValidateID);
  }

  public no() {
    this.dialogRef.close(this.buttonNoID);
  }

  public cancel() {
    this.dialogRef.close(this.buttonCancelID);
  }

  public onEnter() {
    if (this.buttonValidateName === null) {
      this.no();
    } else {
      this.validate();
    }
  }

  public onEscape() {
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
