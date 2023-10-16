import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Utils } from '../../../../utils/Utils';
import { SiteAreaAssetsDataSource } from './site-area-assets-table-data-source';

@Component({
  templateUrl: 'site-area-assets-dialog.component.html',
  providers: [SiteAreaAssetsDataSource],
  styleUrls: ['site-area-assets-dialog.component.scss'],
})
export class SiteAreaAssetsDialogComponent {
  public dialogTitle: string;

  public constructor(
    public siteAreaAssetsDataSource: SiteAreaAssetsDataSource,
    private dialogRef: MatDialogRef<SiteAreaAssetsDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogParams
  ) {
    // default title
    this.dialogTitle = this.translateService.instant('assets.titles');
    if (dialogParams) {
      this.siteAreaAssetsDataSource.setMode(
        Utils.getTableDataSourceModeFromDialogMode(dialogParams.dialogMode)
      );
      this.siteAreaAssetsDataSource.setSiteArea(dialogParams.dialogData);
      this.dialogTitle = this.translateService.instant('site_areas.assigned_assets_to_site_area', {
        siteAreaName: dialogParams.dialogData.name,
      });
      this.siteAreaAssetsDataSource.initDataSource(true);
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
