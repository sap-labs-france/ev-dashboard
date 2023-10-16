import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogMode, DialogParams } from 'types/Authorization';

import { AssetConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { AssetConnectionComponent } from './asset-connection.component';

@Component({
  template:
    '<app-settings-asset-connection #appRef [currentAssetConnection]="currentConnection" [inDialog]="true" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-settings-asset-connection>',
})
export class AssetConnectionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: AssetConnectionComponent;
  public currentConnection!: AssetConnectionSetting;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<AssetConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<AssetConnectionSetting>
  ) {
    this.currentConnection = dialogParams.dialogData;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.save.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
