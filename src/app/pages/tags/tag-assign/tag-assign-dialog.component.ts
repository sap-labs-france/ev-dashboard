import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogParams } from '../../../types/Authorization';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';
import { TagAssignComponent } from './tag-assign.component';

@Component({
  template: '<app-tag-assign #appRef [currentTagVisualID]="tagVisualID" [inDialog]="true" [dialogRef]="dialogRef"></app-tag-assign>',
})
export class TagAssignDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TagAssignComponent;
  public tagVisualID!: string;

  public constructor(
    public dialogRef: MatDialogRef<TagAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Tag>) {
    this.tagVisualID = dialogParams.dialogData?.visualID;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTag.bind(this.appRef),
      this.appRef.close.bind(this.appRef));
  }
}
