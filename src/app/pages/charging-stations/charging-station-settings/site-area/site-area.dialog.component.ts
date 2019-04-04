import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SiteAreaDataSource } from './site-area-dialog-data-source-table';
import { Charger } from 'app/common.types';


@Component({
  templateUrl: 'site-area.dialog.component.html',
  providers: [
    SiteAreaDataSource
  ]
})
export class SiteAreaDialogComponent {
  public charger: Charger;
  constructor(
    public siteAreaDataSource: SiteAreaDataSource,
    private dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.charger = data;
      this.siteAreaDataSource.setCharger(data);
    }
    siteAreaDataSource.setDialogRef(dialogRef);
  }


}
