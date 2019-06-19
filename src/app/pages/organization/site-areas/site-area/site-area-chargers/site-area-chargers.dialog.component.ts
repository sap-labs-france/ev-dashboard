import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SiteAreaChargersDataSource } from './site-area-chargers-data-source-table';


@Component({
  selector: 'app-site-area-chargers-dialog-cmp',
  templateUrl: 'site-area-chargers.dialog.component.html',
})
export class SiteAreaChargersDialogComponent {
  public dialogTitle: String;

  constructor(
    public siteAreaChargersDataSource: SiteAreaChargersDataSource,
    private dialogRef: MatDialogRef<SiteAreaChargersDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) data) {
    // default title
    this.dialogTitle = this.translateService.instant('chargers.chargers');

    if (data) {
      this.siteAreaChargersDataSource.setSiteArea(data);
      this.dialogTitle = this.translateService.instant('site_areas.assigned_chargers_to_site_area', { 'siteAreaName': data.name });
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
