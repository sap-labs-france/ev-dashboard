import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteArea } from 'app/types/SiteArea';

@Component({
  template: '<app-site-area [currentSiteAreaID]="siteAreaID" [inDialog]="true" [dialogRef]="dialogRef"></app-site-area>'
})
export class SiteAreaDialogComponent {
  public siteAreaID!: string;

  constructor(
    public dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.siteAreaID = data;
  }
}
