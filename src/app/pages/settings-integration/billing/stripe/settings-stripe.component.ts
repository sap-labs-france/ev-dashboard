import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../../services/central-server.service';
import { BillingTax } from '../../../../types/Billing';
import { BillingSettings } from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';

@Component({
  selector: 'app-settings-stripe-billing',
  templateUrl: 'settings-stripe.component.html',
})
export class SettingsStripeComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public billingSettings!: BillingSettings;

  public stripe!: UntypedFormGroup;
  public billing!: UntypedFormGroup;
  public url!: AbstractControl;
  public secretKey!: AbstractControl;
  public publicKey!: AbstractControl;
  public immediateBillingAllowed!: AbstractControl;
  public periodicBillingAllowed!: AbstractControl;
  public customerTaxID!: AbstractControl;
  public billingAccountTaxID!: AbstractControl;
  public taxes: BillingTax[] = [];
  public transactionBillingActivated: boolean;
  public isBillingPlatformActive: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService
  ) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.taxes = taxes.result;
    });
    this.transactionBillingActivated = false;
    this.isBillingPlatformActive = this.componentService.isActive(TenantComponents.BILLING_PLATFORM);;
  }

  public ngOnInit() {
    this.stripe = new UntypedFormGroup({
      url: new UntypedFormControl('',
        Validators.compose([
          Validators.maxLength(200),
          Validators.pattern(Constants.URL_PATTERN),
        ]),
      ),
      secretKey: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
        ]),
      ),
      publicKey: new UntypedFormControl('',
        Validators.compose([
          this.validatePublicKey,
        ]),
      ),
    });
    this.billing = new UntypedFormGroup({
      immediateBillingAllowed: new UntypedFormControl(false),
      periodicBillingAllowed: new UntypedFormControl(false),
      customerTaxID: new UntypedFormControl('',
        Validators.compose([
          // Validators.required,
        ]),
      ),
      billingAccountTaxID: new UntypedFormControl('',
        Validators.compose([
          // Validators.required,
        ]),
      )
    }, Validators.compose([
      this.validateBillingMethod
    ]));
    this.formGroup.addControl('stripe', this.stripe);
    this.formGroup.addControl('billing', this.billing);
    // Keep
    this.url = this.stripe.controls['url'];
    this.secretKey = this.stripe.controls['secretKey'];
    this.publicKey = this.stripe.controls['publicKey'];
    this.immediateBillingAllowed = this.billing.controls['immediateBillingAllowed'];
    this.periodicBillingAllowed = this.billing.controls['periodicBillingAllowed'];
    this.customerTaxID = this.billing.controls['customerTaxID'];
    this.billingAccountTaxID = this.billing.controls['billingAccountTaxID'];
    // Set data
    this.updateFormData();
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public validatePublicKey(control: AbstractControl) {
    if (!control.value || /(^pk_test_)/.test(control.value) || /(^pk_live_)/.test(control.value)) {
      return null;
    }
    return { invalid: true };
  }

  public validateSecretKey(control: AbstractControl) {
    if (!control.value || /(^sk_test_)/.test(control.value) || /(^sk_live_)/.test(control.value)) {
      return null;
    }
    return { invalid: true };
  }

  public validateBillingMethod(fg: UntypedFormGroup) {
    if (!fg.value['immediateBillingAllowed'] && !fg.value['periodicBillingAllowed']) {
      return { invalid: true };
    }
    return null;
  }

  public openUrl() {
    if (this.url) {
      window.open(this.url.value);
    }
  }

  private updateFormData() {
    this.transactionBillingActivated = this.billingSettings?.billing?.isTransactionBillingActivated;
    if (this.transactionBillingActivated) {
      this.formGroup.get('stripe')?.disable();
    } else {
      this.formGroup.get('stripe')?.enable();
    }
    if (!Utils.isEmptyObject(this.billingSettings?.stripe) && !Utils.isEmptyObject(this.formGroup.value)) {
      const stripeSetting = this.billingSettings.stripe;
      this.url.setValue(stripeSetting.url);
      this.secretKey.setValue(stripeSetting.secretKey);
      this.publicKey.setValue(stripeSetting.publicKey);
    }
    if (!Utils.isEmptyObject(this.billingSettings?.billing) && !Utils.isEmptyObject(this.formGroup.value)) {
      const billingSetting = this.billingSettings.billing;
      this.immediateBillingAllowed.setValue(!!billingSetting.immediateBillingAllowed);
      this.periodicBillingAllowed.setValue(!!billingSetting.periodicBillingAllowed);
      this.customerTaxID.setValue(billingSetting.customerTaxID || '');
      this.billingAccountTaxID.setValue(billingSetting.billingAccountTaxID || '');
    }
  }
}
