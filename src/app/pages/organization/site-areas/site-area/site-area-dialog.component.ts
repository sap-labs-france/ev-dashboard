import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-site-area [currentSiteAreaID]="siteAreaID" [inDialog]="true" [dialogRef]="dialogRef"></app-site-area>'
})
export class SiteAreaDialogComponent {
  public siteAreaID!: string;

  constructor(
    public dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {

    if (data) {
      this.siteAreaID = data.id;
    }
  }
}
