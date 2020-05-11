import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '<app-asset [currentAssetID]="assetID" [inDialog]="true" [dialogRef]="dialogRef"></app-asset>',
})
export class AssetDialogComponent {
  public assetID!: string;

  constructor(
    public dialogRef: MatDialogRef<AssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.assetID = data;
  }
}
