import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from 'utils/Utils';

import { DialogParams } from '../../types/Authorization';
import { PricingDefinitionDialogData } from '../../types/Pricing';
import { PricingDefinitionsTableDataSource } from './pricing-definitions-table-data-source';
import { PricingDefinitionsComponent } from './pricing-definitions.component';

@Component({
  template: '<app-pricing-definitions #appRef [currentPricingDefinitionID]="currentPricingDefinitionID" [currentEntityID]="currentEntityID" [currentEntityType]="currentEntityType" [inDialog]="true" [dialogRef]="dialogRef"></app-pricing-definitions>',
})

export class PricingDefinitionsDialogComponent implements AfterViewInit{

  @ViewChild('appRef') public appRef!: PricingDefinitionsComponent;
  public currentPricingDefinitionID!: string;
  public currentEntityID!: string;
  public currentEntityType!: string;
  public inDialog!: boolean;

  public constructor(
    public dialogRef: MatDialogRef<PricingDefinitionsComponent>,
    public pricingsTableDataSource: PricingDefinitionsTableDataSource,
    @Inject(MAT_DIALOG_DATA) dialogParams: DialogParams<PricingDefinitionDialogData>) {
    this.currentPricingDefinitionID = dialogParams?.dialogData?.id;
    this.currentEntityID = dialogParams?.dialogData?.context?.entityID;
    this.currentEntityType = dialogParams?.dialogData?.context?.entityType;
    this.pricingsTableDataSource.setContext(this.currentEntityID, this.currentEntityType);
  }

  public close() {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }

  public ngAfterViewInit() {
    // Register key event
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

}
