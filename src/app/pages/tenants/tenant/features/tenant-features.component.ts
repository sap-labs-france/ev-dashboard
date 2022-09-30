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
  public map!: AbstractControl;

  public ngOnInit() {
    // Add feature
    this.formGroup.addControl('features', new FormGroup({}));
    this.features = this.formGroup.controls['features'] as UntypedFormGroup;
    // Create features
    this.features.addControl('map', new FormControl(false));
    // Keep controls
    this.map = this.features.controls['map'];
    this.initialized = true;
    this.loadTenant();
  }

  public ngOnChanges() {
    this.loadTenant();
  }

  public loadTenant() {
    if (this.initialized && this.tenant) {
      this.map.setValue(Utils.convertToBoolean(this.tenant.features?.map));
    }
  }
}
