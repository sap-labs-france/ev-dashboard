import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CustomDialogComponent } from 'shared/dialogs/custom/custom-dialog.component';
import { ButtonAction, CustomButton } from 'types/GlobalType';
import { Utils } from 'utils/Utils';

@Injectable()
export class DialogService {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private matDialog: MatDialog) {}

  public closeAll() {
    this.matDialog.closeAll();
  }

  public createAndShowDialog(
    title: string,
    message: string,
    buttons: CustomButton[],
    withCancelButton: boolean = true
  ): Observable<string> {
    if (withCancelButton) {
      buttons = [
        ...buttons,
        { id: ButtonAction.CANCEL, name: 'general.cancel', cancelButton: true },
      ];
    }
    return this.createAndShowCustomDialog(title, message, buttons);
  }

  public createAndShowOkDialog(title: string, message: string): Observable<string> {
    return this.createAndShowCustomDialog(title, message, [
      { id: ButtonAction.OK, name: 'general.ok', color: 'primary', validateButton: true },
    ]);
  }

  public createAndShowYesNoDialog(title: string, message: string): Observable<string> {
    return this.createAndShowCustomDialog(title, message, [
      { id: ButtonAction.YES, name: 'general.yes', color: 'warn', validateButton: true },
      { id: ButtonAction.NO, name: 'general.no', cancelButton: true },
    ]);
  }

  public createAndShowInvalidChangeCloseDialog(title: string, message: string): Observable<string> {
    return this.createAndShowCustomDialog(title, message, [
      {
        id: ButtonAction.DO_NOT_SAVE_AND_CLOSE,
        name: 'general.do_not_save_and_close',
        color: 'warn',
      },
      { id: ButtonAction.CANCEL, name: 'general.cancel', cancelButton: true },
    ]);
  }

  public createAndShowDirtyChangeCloseDialog(title: string, message: string): Observable<string> {
    return this.createAndShowCustomDialog(title, message, [
      {
        id: ButtonAction.SAVE_AND_CLOSE,
        name: 'general.save_and_close',
        color: 'primary',
        validateButton: true,
      },
      {
        id: ButtonAction.DO_NOT_SAVE_AND_CLOSE,
        name: 'general.do_not_save_and_close',
        color: 'warn',
      },
      { id: ButtonAction.CANCEL, name: 'general.cancel', cancelButton: true },
    ]);
  }

  private createAndShowCustomDialog(
    title: string,
    message: string | string[],
    buttons: CustomButton[]
  ): Observable<string> {
    // Transform i18n Array to HTML message
    if (!Utils.isEmptyArray(message)) {
      message = (message as string[]).join('<br>');
    }
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    // disable close
    dialogConfig.disableClose = true;
    // Set data
    dialogConfig.data = {
      title,
      message,
      buttons,
    };
    // Show
    const dialogRef = this.matDialog.open(CustomDialogComponent, dialogConfig);
    // Register
    return dialogRef.afterClosed();
  }
}
