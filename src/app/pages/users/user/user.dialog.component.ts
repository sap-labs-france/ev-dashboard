import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';
import { User } from 'types/User';

import { Utils } from '../../../utils/Utils';
import { UserComponent } from './user.component';

@Component({
  template: '<app-user #appRef [currentUserID]="currentUserID" [inDialog]="true" [dialogRef]="dialogRef"></app-user>',
})
export class UserDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: UserComponent;
  public currentUserID!: string;

  public constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<User>) {
    this.currentUserID = dialogParams.dialogData?.id;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveUser.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
