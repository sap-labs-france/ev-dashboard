import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

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
  public url!: AbstractControl;
  public secretKey!: AbstractControl;
  public publicKey!: AbstractControl;
  public immediateBillingAllowed!: AbstractControl;
  public periodicBillingAllowed!: AbstractControl;
  public lastSynchronizedOn!: AbstractControl;
  public taxID!: AbstractControl;
  public taxes: BillingTax[] = [];

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.taxes = taxes;
    });
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
      immediateBillingAllowed: new FormControl(''),
      periodicBillingAllowed: new FormControl(''),
      lastSynchronizedOn: new FormControl(''),
      taxID: new FormControl('',
        Validators.compose([
          // Validators.required,
        ]),
      ),
    }, Validators.compose([
      this.validateBillingMethod
    ]));

    this.formGroup.addControl('stripe', this.stripe);

    // Keep
    this.url = this.stripe.controls['url'];
    this.secretKey = this.stripe.controls['secretKey'];
    this.publicKey = this.stripe.controls['publicKey'];
    this.immediateBillingAllowed = this.stripe.controls['immediateBillingAllowed'];
    this.periodicBillingAllowed = this.stripe.controls['periodicBillingAllowed'];
    this.lastSynchronizedOn = this.stripe.controls['lastSynchronizedOn'];
    this.taxID = this.stripe.controls['taxID'];

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
    if (this.stripe) {
      // Set data
      this.url.setValue(this.billingSettings.stripe.url ? this.billingSettings.stripe.url : '');
      this.secretKey.setValue(this.billingSettings.stripe.secretKey ? this.billingSettings.stripe.secretKey : '');
      this.publicKey.setValue(this.billingSettings.stripe.publicKey ? this.billingSettings.stripe.publicKey : '');
      this.immediateBillingAllowed.setValue(this.billingSettings.stripe.immediateBillingAllowed
        ? this.billingSettings.stripe.immediateBillingAllowed : false);
      this.periodicBillingAllowed.setValue(this.billingSettings.stripe.periodicBillingAllowed
        ? this.billingSettings.stripe.periodicBillingAllowed : false);
      this.lastSynchronizedOn.setValue(this.billingSettings.stripe.lastSynchronizedOn
        ? this.billingSettings.stripe.lastSynchronizedOn : '');
      this.taxID.setValue(this.billingSettings.stripe.taxID ? this.billingSettings.stripe.taxID : '');
    }
  }
}
