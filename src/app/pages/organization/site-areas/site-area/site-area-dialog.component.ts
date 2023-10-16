import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  DialogMode,
  DialogParams,
  DialogParamsWithAuth,
  SiteAreasAuthorizations,
} from 'types/Authorization';
import { SiteArea } from 'types/SiteArea';

import { Utils } from '../../../../utils/Utils';
import { SiteAreaComponent } from './site-area.component';

@Component({
  template:
    '<app-site-area #appRef [currentSiteAreaID]="siteAreaID" [siteAreasAuthorizations]="siteAreasAuthorizations" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [smartChargingSessionParametersActive]="smartChargingSessionParametersActive"></app-site-area>',
})
export class SiteAreaDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: SiteAreaComponent;
  public siteAreaID!: string;
  public dialogMode!: DialogMode;
  public siteAreasAuthorizations!: SiteAreasAuthorizations;
  public smartChargingSessionParametersActive: boolean;

  public constructor(
    public dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>
  ) {
    this.siteAreaID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    this.siteAreasAuthorizations = dialogParams.authorizations;
    this.smartChargingSessionParametersActive =
      dialogParams.dialogData?.smartChargingSessionParametersActive;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveSiteArea.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
