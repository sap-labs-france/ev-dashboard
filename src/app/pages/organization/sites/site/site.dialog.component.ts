import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-site-dialog-cmp',
  template: '<app-site-cmp [currentSiteID]="siteID" [inDialog]="true" [dialogRef]="dialogRef"></app-site-cmp>'
})
export class SiteDialogComponent {
  siteID: string;

  constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteID = data;
    }
  }
}
