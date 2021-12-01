import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ComponentService } from '../../services/component.service';
import { TenantComponents } from '../../types/Tenant';
import { PricingDefinitionsTableDataSource } from './pricing-definitions-table-data-source';
import { PricingDefinitionsDialogComponent } from './pricing-definitions.dialog.component';

@Component({
  selector: 'app-pricing-definitions',
  templateUrl: 'pricing-definitions.component.html',
  providers: [PricingDefinitionsTableDataSource],
})
export class PricingDefinitionsComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionsDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: string;
  @Input() public currentEntityName!: string;

  public isActive = false;
  public formGroup: FormGroup;

  public constructor(
    private componentService: ComponentService,
    public pricingsTableDataSource: PricingDefinitionsTableDataSource) {
    this.isActive = this.componentService.isActive(TenantComponents.PRICING);
  }

  public ngOnInit() {
    // Set context with provided entity, will set to tenant by default
    this.pricingsTableDataSource.setContext(this.currentEntityID, this.currentEntityType, this.currentEntityName);
  }

  public close() {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }
}
