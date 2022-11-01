import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogMode, DialogParamsWithAuth, TagsAuthorizations } from '../../../types/Authorization';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';
import { TagAssignComponent } from './tag-assign.component';

@Component({
  template: '<app-tag-assign #appRef [dialogMode]="dialogMode" [currentTagVisualID]="tagVisualID" [inDialog]="true" [tagsAuthorizations]="tagsAuthorizations" [dialogRef]="dialogRef"></app-tag-assign>',
})
export class TagAssignDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TagAssignComponent;
  public tagVisualID!: string;
  public tagsAuthorizations!: TagsAuthorizations;
  public dialogMode: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<TagAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Tag, TagsAuthorizations>) {
    this.tagVisualID = dialogParams.dialogData?.visualID;
    this.tagsAuthorizations = dialogParams.authorizations;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTag.bind(this.appRef),
      this.appRef.close.bind(this.appRef));
  }
}
