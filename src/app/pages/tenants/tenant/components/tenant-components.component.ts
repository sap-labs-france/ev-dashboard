import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import {
  ANALYTICS_TYPES,
  BILLING_TYPES,
  PRICING_TYPES,
  REFUND_TYPES,
  SMART_CHARGING_TYPES,
} from '../../../../shared/model/tenants.model';
import { KeyValue } from '../../../../types/GlobalType';
import { Tenant, TenantComponents } from '../../../../types/Tenant';

@Component({
  selector: 'app-tenant-components',
  templateUrl: 'tenant-components.component.html',
  styleUrls: ['../tenant.component.scss'],
})
export class TenantComponentsComponent implements OnInit, OnChanges {
  @Input() public tenant!: Tenant;
  @Input() public formGroup!: UntypedFormGroup;

  public initialized = false;

  public id!: AbstractControl;
  public components!: UntypedFormGroup;
  public pricingTypes: KeyValue[];
  public billingTypes: KeyValue[];
  public refundTypes: KeyValue[];
  public analyticsTypes: KeyValue[];
  public smartChargingTypes: KeyValue[];

  public constructor() {
    this.pricingTypes = PRICING_TYPES;
    this.billingTypes = BILLING_TYPES;
    this.refundTypes = REFUND_TYPES;
    this.analyticsTypes = ANALYTICS_TYPES;
    this.smartChargingTypes = SMART_CHARGING_TYPES;
  }

  public ngOnInit() {
    // Init component part form
    this.formGroup.addControl('components', new UntypedFormGroup({}));
    // Assign form
    this.components = this.formGroup.controls['components'] as UntypedFormGroup;
    // Create component
    for (const componentIdentifier of Object.values(TenantComponents)) {
      // Create controls
      this.components.addControl(
        componentIdentifier,
        new UntypedFormGroup({
          active: new UntypedFormControl(false),
          type: new UntypedFormControl(''),
        })
      );
    }
    this.initialized = true;
    this.loadTenant();
  }

  public ngOnChanges() {
    this.loadTenant();
  }

  public toggleDropDownActivation(event: MatSlideToggleChange, inputControl: UntypedFormControl) {
    if (inputControl) {
      if (event.checked) {
        inputControl.enable();
      } else {
        inputControl.disable();
      }
    }
  }

  public loadTenant() {
    if (this.initialized && this.tenant) {
      // Add available components
      for (const componentIdentifier of Object.values(TenantComponents)) {
        // Set the params
        if (this.tenant.components && this.tenant.components[componentIdentifier]) {
          // Get component group
          const component = this.components.controls[componentIdentifier] as UntypedFormGroup;
          // Set Active
          component.controls.active.setValue(
            this.tenant.components[componentIdentifier].active === true
          );
          // Set Type
          component.controls.type.setValue(this.tenant.components[componentIdentifier].type);
        }
      }
    }
  }
}
