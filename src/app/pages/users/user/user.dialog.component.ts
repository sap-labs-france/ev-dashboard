import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-user-dialog-cmp',
  templateUrl: 'user.dialog.component.html'
})
export class UserDialogComponent {
  userID: string;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.userID = data;
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  getDialogRef(): MatDialogRef<UserDialogComponent> {
    return this.dialogRef;
  }
}
