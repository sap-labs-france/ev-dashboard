import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ComponentService } from 'services/component.service';
import { SettingAuthorizationActions } from 'types/Authorization';
import { TenantComponents } from 'types/Tenant';
import { Utils } from 'utils/Utils';

import { BillingSettings } from '../../../../types/Setting';

@Component({
  selector: 'app-settings-scan-pay',
  templateUrl: 'settings-scan-pay.component.html',
})
export class SettingsScanPayComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public billingSettings!: BillingSettings;
  @Input() public authorizations!: SettingAuthorizationActions;

  public scanPay!: UntypedFormGroup;
  public scanPayAmount!: AbstractControl;
  public isScanPayActive: boolean;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private componentService: ComponentService
  ) {
    this.isScanPayActive = this.componentService.isActive(TenantComponents.SCAN_PAY);
  }

  public ngOnInit() {
    this.scanPay = new UntypedFormGroup({
      scanPayAmount: new UntypedFormControl('',
        Validators.compose([
          Validators.pattern(/^[+]?[0-9]+$/),
        ])
      )
    });
    this.formGroup.addControl('scanPay', this.scanPay);
    this.scanPayAmount = this.scanPay.controls['scanPayAmount'];
    // Set data
    this.updateFormData();
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  private updateFormData() {
    if (!Utils.isEmptyObject(this.billingSettings?.billing) && !Utils.isEmptyObject(this.formGroup.value)) {
      const billingSetting = this.billingSettings.billing;
      this.scanPayAmount.setValue(billingSetting.scanPayAmount || '');
    }
    // Read only
    if(!this.authorizations.canUpdate) {
      // Async call for letting the sub form groups to init
      setTimeout(() => this.formGroup.disable(), 0);
    }
  }
}
