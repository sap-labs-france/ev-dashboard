import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: '<app-asset [currentAssetID]="assetID" [inDialog]="true" [dialogRef]="dialogRef"></app-asset>',
})
export class AssetDialogComponent {
  public assetID!: string;

  constructor(
    public dialogRef: MatDialogRef<AssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.assetID = data;
    }
  }
}
