import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthorizationDefinitionFieldMetadata, DialogMode, DialogParamsWithAuth, TagsAuthorizations } from 'types/Authorization';
import { Tag } from 'types/Tag';

import { Utils } from '../../../utils/Utils';
import { TagComponent } from './tag.component';

@Component({
  template: '<app-tag #appRef [currentTagID]="tagID" [currentTagVisualID]="tagVisualID" [dialogMode]="dialogMode" [metadata]="metadata" [dialogRef]="dialogRef"></app-tag>',
})
export class TagDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: TagComponent;
  public tagID!: string;
  public tagVisualID!: string;
  public dialogMode!: DialogMode;
  public metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;

  public constructor(
    public dialogRef: MatDialogRef<TagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Tag, TagsAuthorizations>) {
    this.tagID = dialogParams.dialogData?.id;
    this.tagVisualID = dialogParams.dialogData?.visualID;
    this.metadata = dialogParams.authorizations?.metadata;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTag.bind(this.appRef),
      this.appRef.close.bind(this.appRef));
  }
}
