import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogMode, DialogParams } from '../../../types/Authorization';
import { PricingDefinitionDialogData } from '../../../types/Pricing';
import { Utils } from '../../../utils/Utils';
import { PricingDefinitionComponent } from './pricing-definition.component';

@Component({
  template:
    '<app-pricing-definition #appRef [dialogMode]="dialogMode" [currentPricingDefinitionID]="pricingDefinitionID" [currentEntityID]="entityID" [currentEntityType]="entityType" [currentEntityName]="entityName" [dialogRef]="dialogRef"></app-pricing-definition>',
})
export class PricingDefinitionDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: PricingDefinitionComponent;
  public pricingDefinitionID!: string;
  public entityID!: string;
  public entityType!: string;
  public entityName!: string;
  public dialogMode!: DialogMode;

  public constructor(
    public dialogRef: MatDialogRef<PricingDefinitionComponent>,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<PricingDefinitionDialogData>
  ) {
    this.pricingDefinitionID = dialogParams?.dialogData?.id;
    this.entityID = dialogParams?.dialogData?.context?.entityID;
    this.entityType = dialogParams?.dialogData?.context?.entityType;
    this.entityName = dialogParams?.dialogData?.context?.entityName;
    this.dialogMode = dialogParams.dialogMode;
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.savePricingDefinition.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
