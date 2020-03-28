import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SiteAreaBuildingsDataSource } from './site-area-buildings-table-data-source';

@Component({
  templateUrl: 'site-area-buildings-dialog.component.html',
})
export class SiteAreaBuildingsDialogComponent {
  public dialogTitle: string;

  constructor(
    public siteAreaBuildingsDataSource: SiteAreaBuildingsDataSource,
    private dialogRef: MatDialogRef<SiteAreaBuildingsDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // default title
    this.dialogTitle = this.translateService.instant('buildings.titles');

    if (data) {
      this.siteAreaBuildingsDataSource.setSiteArea(data);
      this.dialogTitle = this.translateService.instant('site_areas.assigned_buildings_to_site_area', { siteAreaName: data.name });
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }
}
