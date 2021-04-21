import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';
import { Site } from 'types/Site';

import { Utils } from '../../../../utils/Utils';
import { SiteComponent } from './site.component';

@Component({
  template: '<app-site #appRef [currentSiteID]="currentSiteID" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-site>',
})
export class SiteDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SiteComponent;
  public currentSiteID!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<Site>) {
    this.currentSiteID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveSite.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
