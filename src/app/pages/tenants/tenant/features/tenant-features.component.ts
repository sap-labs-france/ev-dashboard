import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { Utils } from 'utils/Utils';

import { Tenant } from '../../../../types/Tenant';

@Component({
  selector: 'app-tenant-features',
  templateUrl: 'tenant-features.component.html',
  styleUrls: ['../tenant.component.scss']
})
export class TenantFeaturesComponent implements OnInit, OnChanges {
  @Input() public tenant!: Tenant;
  @Input() public formGroup!: FormGroup;

  public initialized = false;

  public features!: FormGroup;
  public chargingStationMap!: AbstractControl;
  public userPricing!: AbstractControl;

  public ngOnInit() {
    // Add feature
    this.formGroup.addControl('features', new FormGroup({}));
    this.features = this.formGroup.controls['features'] as UntypedFormGroup;
    // Create features
    this.features.addControl('chargingStationMap', new FormControl(false));
    this.features.addControl('userPricing', new FormControl(false));
    // Keep controls
    this.chargingStationMap = this.features.controls['chargingStationMap'];
    this.userPricing = this.features.controls['userPricing'];
    this.initialized = true;
    this.loadTenant();
  }

  public ngOnChanges() {
    this.loadTenant();
  }

  public loadTenant() {
    if (this.initialized && this.tenant) {
      this.chargingStationMap.setValue(Utils.convertToBoolean(this.tenant.features?.chargingStationMap));
      this.userPricing.setValue(Utils.convertToBoolean(this.tenant.features?.userPricing));
    }
  }
}
