import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from 'utils/Utils';

import { DialogParams } from '../../../types/Authorization';
import { PricingDefinitionDialogData } from '../../../types/Pricing';
import { PricingDefinitionComponent } from './pricing-definition.component';

@Component({
  template: '<app-pricing-definition #appRef [currentPricingDefinitionID]="currentPricingDefinitionID" [currentEntityID]="currentEntityID" [currentEntityType]="currentEntityType" [currentEntityName]="currentEntityName" [inDialog]="true" [dialogRef]="dialogRef"></app-pricing-definition>',
})
export class PricingDefinitionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: PricingDefinitionComponent;
  public currentPricingDefinitionID!: string;
  public currentEntityID!: string;
  public currentEntityType!: string;
  public currentEntityName!: string;

  public constructor(
    public dialogRef: MatDialogRef<PricingDefinitionComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<PricingDefinitionDialogData>) {
    this.currentPricingDefinitionID = dialogParams?.dialogData?.id;
    this.currentEntityID = dialogParams?.dialogData?.context?.entityID;
    this.currentEntityType = dialogParams?.dialogData?.context?.entityType;
    this.currentEntityName = dialogParams?.dialogData?.context?.entityName;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.appRef.formGroup,
      this.appRef.save.bind(this.appRef), this.appRef.close.bind(this.appRef));
  }
}
