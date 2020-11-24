import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Utils } from '../../../../utils/Utils';
import { SiteAreaAssetsDataSource } from './site-area-assets-table-data-source';

@Component({
  templateUrl: 'site-area-assets-dialog.component.html',
  providers: [SiteAreaAssetsDataSource]
})
export class SiteAreaAssetsDialogComponent {
  public dialogTitle: string;

  constructor(
    public siteAreaAssetsDataSource: SiteAreaAssetsDataSource,
    private dialogRef: MatDialogRef<SiteAreaAssetsDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // default title
    this.dialogTitle = this.translateService.instant('assets.titles');
    if (data) {
      this.siteAreaAssetsDataSource.setSiteArea(data);
      this.dialogTitle = this.translateService.instant('site_areas.assigned_assets_to_site_area', { siteAreaName: data.name });
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
