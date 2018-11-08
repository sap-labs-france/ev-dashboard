import {Injectable} from '@angular/core';
import {ButtonType, DialogType} from '../common.types';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {Observable} from 'rxjs';
import {Constants} from '../utils/Constants';
import {ConfirmationDialogComponent} from '../shared/dialogs/confirmation/confirmation-dialog-component';

@Injectable()
export class DialogService {
  constructor() {
  }

  public createAndShowOkCancelDialog(dialog: MatDialog, title: string, message: string): Observable<ButtonType> {
    // Call
    return this._createAndShowDialog(dialog, ConfirmationDialogComponent, Constants.DIALOG_TYPE_OK_CANCEL, title, message);
  }

  public createAndShowYesNoDialog(dialog: MatDialog, title: string, message: string): Observable<ButtonType> {
    // Call
    return this._createAndShowDialog(dialog, ConfirmationDialogComponent, Constants.DIALOG_TYPE_YES_NO, title, message);
  }

  private _createAndShowDialog(dialog: MatDialog, component: any,
                               dialogType: DialogType, title: string, message: string): Observable<ButtonType> {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    // Set data
    dialogConfig.data = {
      title, message, dialogType
    }
    // Show
    const dialogRef = dialog.open(component, dialogConfig);
    // Register
    return dialogRef.afterClosed();
  }
}
