import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-site [currentSiteID]="siteID" [inDialog]="true" [dialogRef]="dialogRef"></app-site>',
})
export class SiteDialogComponent {
  siteID: string;

  constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteID = data.id;
    }
  }
}
