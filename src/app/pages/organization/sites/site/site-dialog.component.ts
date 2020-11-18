import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../../utils/Utils';
import { SiteComponent } from './site.component';

@Component({
  template: '<app-site #appRef [currentSiteID]="siteID" [inDialog]="true" [dialogRef]="dialogRef"></app-site>',
})
export class SiteDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SiteComponent;
  public siteID!: string;

  constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.siteID = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveSite.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
