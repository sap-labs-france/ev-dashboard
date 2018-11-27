import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


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
  }
}
