import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogMode, DialogParams } from '../../../types/Authorization';
import { ChargingStationTemplate } from '../../../types/ChargingStationTemplate';
import { Utils } from '../../../utils/Utils';
import { ChargingStationTemplateComponent } from './charging-station-template.component';

@Component({
  template: '<app-charging-station-template #appRef [currentTemplateID]="templateID" [dialogMode]="dialogMode" [dialogRef]="dialogRef"></app-charging-station-template>',
})
export class ChargingStationTemplateDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationTemplateComponent;
  public templateID!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<ChargingStationTemplate>) {
    this.templateID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.saveTemplate.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
