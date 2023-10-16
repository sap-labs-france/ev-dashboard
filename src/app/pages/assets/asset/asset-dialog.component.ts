import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asset } from 'types/Asset';
import { AssetsAuthorizations, DialogMode, DialogParamsWithAuth } from 'types/Authorization';

import { Utils } from '../../../utils/Utils';
import { AssetComponent } from './asset.component';

@Component({
  template:
    '<app-asset #appRef [currentAssetID]="assetID" [dialogMode]="dialogMode" [assetsAuthorizations]="assetsAuthorizations" [dialogRef]="dialogRef"></app-asset>',
})
export class AssetDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: AssetComponent;
  public assetID!: string;
  public dialogMode!: DialogMode;
  public assetsAuthorizations!: AssetsAuthorizations;

  public constructor(
    public dialogRef: MatDialogRef<AssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParamsWithAuth<Asset, AssetsAuthorizations>
  ) {
    this.assetID = dialogParams.dialogData?.id as string;
    this.dialogMode = dialogParams.dialogMode;
    this.assetsAuthorizations = dialogParams.authorizations;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveAsset.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
