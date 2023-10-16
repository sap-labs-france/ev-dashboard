import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import {
  ChargingStationTemplateAuthorizations,
  DialogMode,
  DialogParamsWithAuth,
} from '../../../types/Authorization';
import { ChargingStationTemplate } from '../../../types/ChargingStationTemplate';
import { Utils } from '../../../utils/Utils';
import { ChargingStationTemplateComponent } from './charging-station-template.component';

@Component({
  template:
    '<app-charging-station-template #appRef [currentTemplateID]="templateID" [dialogMode]="dialogMode" [dialogRef]="dialogRef" [dialogTitle]="dialogTitle"></app-charging-station-template>',
})
export class ChargingStationTemplateDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationTemplateComponent;
  public templateID!: string;
  public dialogMode!: DialogMode;
  public dialogTitle: string;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationTemplateDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<
    ChargingStationTemplate,
    ChargingStationTemplateAuthorizations
    >
  ) {
    this.templateID = dialogParams.dialogData?.id;
    this.dialogMode = dialogParams.dialogMode;
    if (
      dialogParams?.dialogData?.template.chargePointVendor &&
      dialogParams?.dialogData?.template.extraFilters.chargePointModel
    ) {
      this.dialogTitle =
        dialogParams.dialogData.template.chargePointVendor +
        ' - ' +
        dialogParams.dialogData.template.extraFilters.chargePointModel;
    } else {
      this.dialogTitle = this.translateService.instant('templates.title');
    }
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerCloseKeyEvents(this.dialogRef);
  }
}
