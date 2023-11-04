import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { TenantSupport } from '../../types/TenantSupport';
import { Users } from '../../utils/Users';

@Component({
  selector: 'app-tenant-support',
  templateUrl: 'tenant-support.component.html',
})
export class TenantSupportComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public tenantSupport!: TenantSupport;
  public tenantSupportFormGroup!: UntypedFormGroup;
  public supportPhone!: AbstractControl;
  public supportEmail: AbstractControl;
  public initialized = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {}

  public ngOnInit() {
    this.tenantSupportFormGroup = new UntypedFormGroup({
      supportPhone: new UntypedFormControl(null,
        Validators.compose([
          Users.validatePhone,
        ])
      ),
      supportEmail: new UntypedFormControl(null,
        Validators.compose([
          Validators.email,
        ])
      )
    });
    // Add the form group to the parent component
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('support', this.tenantSupportFormGroup);
    } else {
      this.tenantSupportFormGroup.disable();
    }
    // Form
    this.supportPhone = this.tenantSupportFormGroup.controls['supportPhone'];
    this.supportEmail = this.tenantSupportFormGroup.controls['supportEmail'];
    this.initialized = true;
    this.loadSupport();
  }

  public ngOnChanges() {
    this.loadSupport();
  }

  public loadSupport() {
    if (this.initialized && this.tenantSupport) {
      if (this.tenantSupport.supportEmail) {
        this.supportEmail.setValue(this.tenantSupport.supportEmail ?? null);
      }
      if (this.tenantSupport.supportPhone) {
        this.supportPhone.setValue(this.tenantSupport.supportPhone ?? null);
      }
    }
  }
}
