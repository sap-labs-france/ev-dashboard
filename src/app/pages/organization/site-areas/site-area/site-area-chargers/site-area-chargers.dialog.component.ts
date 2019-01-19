import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SiteAreaChargersDataSource} from './site-area-chargers-data-source-table';


@Component({
  selector: 'app-site-area-chargers-dialog-cmp',
  styleUrls: ['../../../../../shared/dialogs/dialogs.component.scss'],
  templateUrl: 'site-area-chargers.dialog.component.html'
})
export class SiteAreaChargersDialogComponent {

  constructor(
    public siteAreaChargersDataSource: SiteAreaChargersDataSource,
    private dialogRef: MatDialogRef<SiteAreaChargersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteAreaChargersDataSource.setSiteArea(data);
    }
  }
}
