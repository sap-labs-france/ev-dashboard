import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogParams } from 'types/Authorization';

import { SiteArea } from '../../../../types/SiteArea';
import { Utils } from '../../../../utils/Utils';
import { SiteAreaChargingStationsDataSource } from './site-area-charging-stations-table-data-source';

@Component({
  templateUrl: 'site-area-charging-stations-dialog.component.html',
  providers: [SiteAreaChargingStationsDataSource]
})
export class SiteAreaChargingStationsDialogComponent {
  public dialogTitle: string;

  public constructor(
    public siteAreaChargersDataSource: SiteAreaChargingStationsDataSource,
    private dialogRef: MatDialogRef<SiteAreaChargingStationsDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<SiteArea>) {
    // default title
    this.dialogTitle = this.translateService.instant('chargers.chargers');
    if (dialogParams) {
      if (dialogParams.dialogData) {
        this.siteAreaChargersDataSource.setSiteArea(dialogParams.dialogData);
        this.dialogTitle = this.translateService.instant('site_areas.assigned_chargers_to_site_area',
          { siteAreaName: dialogParams.dialogData.name });
      }
      this.siteAreaChargersDataSource.setMode(
        Utils.getTableDataSourceModeFromDialogMode(dialogParams.dialogMode));
      this.siteAreaChargersDataSource.initDataSource(true);
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
