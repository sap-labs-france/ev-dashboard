import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { GridMonitoringConnectionSetting } from '../../../../types/Setting';
import { Utils } from '../../../../utils/Utils';
import { GridMonitoringConnectionComponent } from './grid-monitoring-connection.component';

@Component({
  template: '<app-settings-grid-monitoring-connection #appRef [currentGridMonitoringConnection]="currentConnection" [dialogRef]="dialogRef"></app-settings-grid-monitoring-connection>',
})
export class GridMonitoringConnectionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: GridMonitoringConnectionComponent;
  public currentConnection!: GridMonitoringConnectionSetting;

  public constructor(
    public dialogRef: MatDialogRef<GridMonitoringConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: GridMonitoringConnectionSetting) {
    this.currentConnection = data;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
