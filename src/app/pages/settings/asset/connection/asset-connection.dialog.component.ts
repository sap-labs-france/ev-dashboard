import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssetConnectionSetting } from 'app/types/Setting';

@Component({
  template: '<app-settings-asset-connection [currentAssetConnection]="currentConnection" [inDialog]="true" [dialogRef]="dialogRef"></app-settings-asset-connection>',
})
export class AssetConnectionDialogComponent {
  public currentConnection!: AssetConnectionSetting;

  constructor(
    public dialogRef: MatDialogRef<AssetConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AssetConnectionSetting) {
    this.currentConnection = data;
  }
}
