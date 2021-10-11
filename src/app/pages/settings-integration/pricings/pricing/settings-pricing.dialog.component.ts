import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogParams } from 'types/Authorization';

import { PricingDefinitionDialogData } from '../../../../types/Pricing';
import { Utils } from '../../../../utils/Utils';
import { SettingsPricingComponent } from './settings-pricing.component';

@Component({
  template: '<app-pricing #appRef [currentPricingDefinitionID]="currentPricingDefinitionID" [inDialog]="true" [dialogRef]="dialogRef"></app-pricing>',
})

export class SettingsPricingDialogComponent implements AfterViewInit {

  @ViewChild('appRef') public appRef!: SettingsPricingComponent;
  public currentPricingDefinitionID!: string;

  public constructor(
    public dialogRef: MatDialogRef<SettingsPricingComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<PricingDefinitionDialogData>) {
    this.currentPricingDefinitionID = dialogParams.dialogData.id;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
