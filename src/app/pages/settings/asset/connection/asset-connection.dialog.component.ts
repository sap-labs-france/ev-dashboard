import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssetConnectionSetting } from 'app/types/Setting';

@Component({
  template: '<app-settings-asset-connection [currentAssetConnection]="currentConnection" [inDialog]="true" [dialogRef]="dialogRef"></app-settings-asset-connection>',
})
export class AssetConnectionDialogComponent {
  public currentConnection!: Partial<AssetConnectionSetting>;

  constructor(
    public dialogRef: MatDialogRef<AssetConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: Partial<AssetConnectionSetting>) {

    if (data) {
      this.currentConnection = data;
    } else {
      this.currentConnection = {
        id: '',
        name: '',
        description: '',
        type: '',
        url: '',
        loginCredentials: {
          user: '',
          password: ''
        }
      };
    }
  }
}
