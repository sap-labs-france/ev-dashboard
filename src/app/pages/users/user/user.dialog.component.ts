import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-user [currentUserID]="userID" [inDialog]="true" [dialogRef]="getDialogRef()"></app-user>',
})
export class UserDialogComponent {
  public userID!: string;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.userID = data;
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  public getDialogRef(): MatDialogRef<UserDialogComponent> {
    return this.dialogRef;
  }
}
