import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-site-dialog-cmp',
  templateUrl: 'site.dialog.component.html'
})
export class SiteDialogComponent {
  siteID: string;

  constructor(
    private dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteID = data;
    }
  }
}
