import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingSettings, PartialBillingTax } from 'app/common.types';
import { Constants } from 'app/utils/Constants';
import { CentralServerService } from '../../../../services/central-server.service';
import { StripeToolBox } from './StripeToolbox';

export class StripeBillingConstants {
  public static BILLING_METHOD_IMMEDIATE = 'immediate';
  public static BILLING_METHOD_PERIODIC = 'periodic';
}

@Component({
  selector: 'app-settings-stripe-billing',
  templateUrl: 'settings-stripe.component.html',
})
export class SettingsStripeComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() billingSettings: BillingSettings;

  public stripe: FormGroup;
  public stripeUrl: AbstractControl;
  public stripeSecretKey: AbstractControl;
  public stripePublicKey: AbstractControl;
  public stripeImmediateBillingAllowed: AbstractControl;
  public stripePeriodicBillingAllowed: AbstractControl;
  public stripeLastSynchronizedOn: AbstractControl;
  public stripeTax: AbstractControl;
  public availableStripeTaxes: PartialBillingTax[] = [];

  ngOnInit() {
    this.stripe = new FormGroup({
      url: new FormControl('',
        Validators.compose([
          Validators.required,
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
          Validators.required,
          Validators.maxLength(100),
          StripeToolBox.validatePublicKey,
        ]),
      ),
      immediateBillingAllowed: new FormControl(''),
      periodicBillingAllowed: new FormControl(''),
      lastSynchronizedOn: new FormControl(''),
      taxID: new FormControl('',
        Validators.compose([
          Validators.required,
        ]),
      ),
    });

    this.formGroup.addControl('stripe', this.stripe);

    // Keep
    this.stripeUrl = this.stripe.controls['url'];
    this.stripeSecretKey = this.stripe.controls['secretKey'];
    this.stripePublicKey = this.stripe.controls['publicKey'];
    this.stripeImmediateBillingAllowed = this.stripe.controls['immediateBillingAllowed'];
    this.stripePeriodicBillingAllowed = this.stripe.controls['periodicBillingAllowed'];
    this.stripeLastSynchronizedOn = this.stripe.controls['lastSynchronizedOn'];
    this.stripeTax = this.stripe.controls['taxID'];
    this.stripeTax.setValue('none');

    // Set data
    this.updateFormData(true);
  }

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.availableStripeTaxes = taxes;
    });
  }

  ngOnChanges() {
    this.updateFormData();
  }

  updateFormData(firstTime = false) {
    // Set data
    if (this.stripeUrl) {
      this.stripeUrl.setValue(this.billingSettings.stripe.url ? this.billingSettings.stripe.url : '');
    }
    if (this.stripeSecretKey) {
      this.stripeSecretKey.setValue(this.billingSettings.stripe.secretKey ? this.billingSettings.stripe.secretKey : '');
    }
    if (this.stripePublicKey) {
      this.stripePublicKey.setValue(this.billingSettings.stripe.publicKey ? this.billingSettings.stripe.publicKey : '');
    }
    if (this.stripeImmediateBillingAllowed) {
      this.stripeImmediateBillingAllowed.setValue(this.billingSettings.stripe.immediateBillingAllowed
        ? this.billingSettings.stripe.immediateBillingAllowed : '');
    }
    if (this.stripePeriodicBillingAllowed) {
      this.stripePeriodicBillingAllowed.setValue(this.billingSettings.stripe.periodicBillingAllowed
        ? this.billingSettings.stripe.periodicBillingAllowed : '');
    }
    if (this.stripeLastSynchronizedOn) {
      this.stripeLastSynchronizedOn.setValue(this.billingSettings.stripe.lastSynchronizedOn
        ? this.billingSettings.stripe.lastSynchronizedOn : '');
    }
    if (this.stripeTax) {
      this.stripeTax.setValue(this.billingSettings.stripe.taxID ? this.billingSettings.stripe.taxID : 'none');
    }
  }

  openUrl() {
    window.open(this.stripeUrl.value);
  }
}
