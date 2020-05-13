import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-site [currentSiteID]="siteID" [inDialog]="true" [dialogRef]="dialogRef"></app-site>',
})
export class SiteDialogComponent {
  public siteID!: string;

  constructor(
    public dialogRef: MatDialogRef<SiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.siteID = data;
  }
}
