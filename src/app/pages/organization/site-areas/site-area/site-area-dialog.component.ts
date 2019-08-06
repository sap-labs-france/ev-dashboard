import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-site-area-dialog-cmp',
  template: '<app-site-area-cmp [currentSiteAreaID]="siteAreaID" [inDialog]="true" [dialogRef]="dialogRef"></app-site-area-cmp>'
})
export class SiteAreaDialogComponent {
  siteAreaID: string;

  constructor(
    public dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteAreaID = data.id;
    }
  }
}
