import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { AssetConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { AssetConnectionComponent } from './asset-connection.component';

@Component({
  template: '<app-settings-asset-connection #appRef [currentAssetConnection]="currentConnection" [inDialog]="true" [dialogRef]="dialogRef"></app-settings-asset-connection>',
})
export class AssetConnectionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: AssetConnectionComponent;
  public currentConnection!: AssetConnectionSetting;

  public constructor(
    public dialogRef: MatDialogRef<AssetConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AssetConnectionSetting) {
    this.currentConnection = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
