import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { User } from 'types/User';

import { Utils } from '../../../utils/Utils';
import { UserComponent } from './user.component';

@Component({
  template: '<app-user #appRef [currentUserID]="currentUserID" [dialogMode]="dialogMode" [inDialog]="true" [dialogRef]="dialogRef"></app-user>',
})
export class UserDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: UserComponent;
  public currentUserID!: string;
  public dialogMode: DialogMode;
  public constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<User>) {
    this.currentUserID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveUser.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
