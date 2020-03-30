import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingTax } from 'app/types/Billing';
import { BillingSettings } from 'app/types/Setting';
import { Constants } from 'app/utils/Constants';
import { CentralServerService } from '../../../../services/central-server.service';

export class StripeBillingConstants {
  public static BILLING_METHOD_IMMEDIATE = 'immediate';
  public static BILLING_METHOD_PERIODIC = 'periodic';
}

@Component({
  selector: 'app-settings-stripe-billing',
  templateUrl: 'settings-stripe.component.html',
})
export class SettingsStripeComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Input() billingSettings!: BillingSettings;

  public stripe!: FormGroup;
  public url!: AbstractControl;
  public secretKey!: AbstractControl;
  public publicKey!: AbstractControl;
  public immediateBillingAllowed!: AbstractControl;
  public periodicBillingAllowed!: AbstractControl;
  public lastSynchronizedOn!: AbstractControl;
  public taxID!: AbstractControl;
  public taxes: BillingTax[] = [];

  ngOnInit() {
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
          Validators.maxLength(100),
           // StripeToolBox.validateSecretKey
        ]),
      ),
      publicKey: new FormControl('',
        Validators.compose([
          Validators.maxLength(100),
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
    });

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
    this.updateFormData(true);
  }

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.taxes = taxes;
    });
  }

  ngOnChanges() {
    this.updateFormData();
  }

  private updateFormData(firstTime = false) {
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
    console.log(!fg.value['immediateBillingAllowed'] && !fg.value['periodicBillingAllowed'])
    return { invalid: !fg.value['immediateBillingAllowed'] && !fg.value['periodicBillingAllowed'] };
  }

  public openUrl() {
    if (this.url) {
      window.open(this.url.value);
    }
  }
}
