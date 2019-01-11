import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-site-area-dialog-cmp',
  templateUrl: 'site-area.dialog.component.html'
})
export class SiteAreaDialogComponent {
  siteAreaID: string;

  constructor(
    private dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.siteAreaID = data;
    }
  }
}
