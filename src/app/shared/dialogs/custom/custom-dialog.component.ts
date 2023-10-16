import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CustomButton } from 'types/GlobalType';

import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'custom-dialog.component.html',
})
export class CustomDialogComponent implements AfterViewInit {
  public title = '';
  public message = '';
  public buttons: CustomButton[] = [];
  private canCancelDialog = false;

  public constructor(
    protected dialogRef: MatDialogRef<CustomDialogComponent>,
    protected translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    // Set
    this.title = data.title;
    this.message = data.message;
    this.buttons = data.buttons;
    Utils.registerValidateCloseKeyEvents(
      this.dialogRef,
      this.onEnter.bind(this),
      this.onEscape.bind(this)
    );
  }

  public ngAfterViewInit() {
    this.canCancelDialog = true;
  }

  public close(buttonID: string) {
    this.dialogRef.close(buttonID);
  }

  public onEnter() {
    for (const button of this.buttons) {
      if (button.validateButton) {
        this.dialogRef.close(button.id);
        break;
      }
    }
  }

  public onEscape() {
    if (this.canCancelDialog) {
      for (const button of this.buttons) {
        if (button.cancelButton) {
          this.dialogRef.close(button.id);
          break;
        }
      }
    }
  }
}
