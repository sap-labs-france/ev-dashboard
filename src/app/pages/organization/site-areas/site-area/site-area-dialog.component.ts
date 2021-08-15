import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { SiteArea } from 'types/SiteArea';

import { Utils } from '../../../../utils/Utils';
import { SiteAreaComponent } from './site-area.component';

@Component({
  template: '<app-site-area #appRef [currentSiteAreaID]="siteAreaID" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-site-area>'
})
export class SiteAreaDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SiteAreaComponent;
  public siteAreaID!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<SiteArea>) {
    this.siteAreaID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveSiteArea.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
