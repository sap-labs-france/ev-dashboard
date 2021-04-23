import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';
import { Tag } from 'types/Tag';

import { Utils } from '../../../utils/Utils';
import { TagComponent } from './tag.component';

@Component({
  template: '<app-tag #appRef [currentTagID]="tagID" [inDialog]="true" [dialogRef]="dialogRef"></app-tag>',
})
export class TagDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TagComponent;
  public tagID!: string;

  public constructor(
    public dialogRef: MatDialogRef<TagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Tag>) {
    this.tagID = dialogParams.dialogData?.id;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTag.bind(this.appRef),
      this.appRef.close.bind(this.appRef));
  }
}
