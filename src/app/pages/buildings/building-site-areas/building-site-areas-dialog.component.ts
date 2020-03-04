import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BuildingSiteAreasDataSource } from './building-site-areas-table-data-source';

@Component({
  templateUrl: 'building-site-areas-dialog.component.html',
})
export class BuildingSiteAreasDialogComponent {
  public dialogTitle: string;

  constructor(
    public buildingSiteAreasDataSource: BuildingSiteAreasDataSource,
    private dialogRef: MatDialogRef<BuildingSiteAreasDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // Default title
    this.dialogTitle = this.translateService.instant('site_areas.titles');
    if (data) {
      this.buildingSiteAreasDataSource.setBuilding(data);
      this.dialogTitle = this.translateService.instant('site_areas.assigned_siteAreas_to_building', { buildingName: data.name });
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
