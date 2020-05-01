import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'app/types/User';

@Component({
  template: '<app-user [currentUserID]="userID" [inDialog]="true" [dialogRef]="getDialogRef()"></app-user>',
})
export class UserDialogComponent {
  public userID!: string;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: User) {
    if (data) {
      this.userID = data.id;
    }
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
