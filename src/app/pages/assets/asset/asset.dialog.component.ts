import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Utils } from '../../../utils/Utils';
import { AssetComponent } from './asset.component';

@Component({
  template: '<app-asset #appRef [currentAssetID]="assetID" [inDialog]="true" [dialogRef]="dialogRef"></app-asset>',
})
export class AssetDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: AssetComponent;
  public assetID!: string;

  constructor(
    public dialogRef: MatDialogRef<AssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: string) {
    this.assetID = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveAsset.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
