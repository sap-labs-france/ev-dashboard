import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParamsWithAuth, SitesAuthorizations } from 'types/Authorization';
import { Site } from 'types/Site';

import { Utils } from '../../../../utils/Utils';
import { SiteComponent } from './site.component';

@Component({
  template:
    '<app-site #appRef [currentSiteID]="siteID" [dialogMode]="dialogMode" [sitesAuthorizations]="sitesAuthorizations" [dialogRef]="dialogRef"></app-site>',
})
export class SiteDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SiteComponent;
  public siteID!: string;
  public dialogMode!: DialogMode;
  public sitesAuthorizations!: SitesAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Site, SitesAuthorizations>
  ) {
    this.siteID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.sitesAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveSite.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
