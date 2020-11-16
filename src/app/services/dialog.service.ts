import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ConfirmationDialogComponent } from '../shared/dialogs/confirmation/confirmation-dialog.component';
import { ButtonType, DialogType } from '../types/Table';

@Injectable()
export class DialogService {
  constructor(private matDialog: MatDialog) {
  }

  public closeAll() {
    this.matDialog.closeAll();
  }

  public createAndShowOkCancelDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.OK_CANCEL, title, message);
  }

  public createAndShowOkDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.OK, title, message);
  }

  public createAndShowYesNoDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.YES_NO, title, message);
  }

  public createAndShowYesNoCancelDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.YES_NO_CANCEL, title, message);
  }

  public createAndShowInvalidChangeCloseDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.INVALID_CHANGE, title, message);
  }

  public createAndShowDirtyChangeCloseDialog(title: string, message: string): Observable<ButtonType> {
    // Call
    return this.createAndShowDialog(ConfirmationDialogComponent, DialogType.DIRTY_CHANGE, title, message);
  }

  private createAndShowDialog(component: any, dialogType: DialogType, title: string, message: string): Observable<ButtonType> {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    // disable close
    dialogConfig.disableClose = true;
    // Set data
    dialogConfig.data = {
      title, message, dialogType,
    };
    // Show
    const dialogRef = this.matDialog.open(component, dialogConfig);
    // Register
    return dialogRef.afterClosed();
  }
}
