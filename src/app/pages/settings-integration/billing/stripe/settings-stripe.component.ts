import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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
  @Input() public formGroup!: FormGroup;
  @Input() public billingSettings!: BillingSettings;

  public stripe!: FormGroup;
  public billing!: FormGroup;
  public url!: AbstractControl;
  public secretKey!: AbstractControl;
  public publicKey!: AbstractControl;
  public immediateBillingAllowed!: AbstractControl;
  public periodicBillingAllowed!: AbstractControl;
  public taxID!: AbstractControl;
  public taxes: BillingTax[] = [];
  public transactionBillingActivated: boolean;

  public constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.taxes = taxes;
    });
    this.transactionBillingActivated = false;
  }

  public ngOnInit() {
    this.stripe = new FormGroup({
      url: new FormControl('',
        Validators.compose([
          Validators.maxLength(200),
          Validators.pattern(Constants.URL_PATTERN),
        ]),
      ),
      secretKey: new FormControl('',
        Validators.compose([
          Validators.required,
        ]),
      ),
      publicKey: new FormControl('',
        Validators.compose([
          this.validatePublicKey,
        ]),
      ),
    });
    this.billing = new FormGroup({
      immediateBillingAllowed: new FormControl(false),
      periodicBillingAllowed: new FormControl(false),
      taxID: new FormControl('',
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
    this.taxID = this.billing.controls['taxID'];
    // Set data
    this.updateFormData();
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public validatePublicKey(control: AbstractControl) {
    // Check
    if (!control.value || /(^pk_test_)/.test(control.value) || /(^pk_live_)/.test(control.value)) {
      // Ok
      return null;
    }
    return { invalid: true };
  }

  public validateSecretKey(control: AbstractControl) {
    // Check
    if (!control.value || /(^sk_test_)/.test(control.value) || /(^sk_live_)/.test(control.value)) {
      // Ok
      return null;
    }
    return { invalid: true };
  }

  public validateBillingMethod(fg: FormGroup) {
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
    this.transactionBillingActivated = this.billingSettings?.billing?.isTransactionBillingActivated
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
      this.taxID.setValue(billingSetting.taxID || '');
    }
  }
}
