import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingSettings } from 'app/common.types';
import { Constants } from 'app/utils/Constants';
import { StripeToolBox } from './StripeToolbox';

export class StripeBillingConstants {
  public static BILLING_METHOD_IMMEDIATE = 'immediate';
  public static BILLING_METHOD_PERIODIC = 'periodic';
}

@Component({
  selector: 'app-settings-stripe-billing',
  templateUrl: 'settings-stripe.component.html'
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

  ngOnInit() {
    this.formGroup.addControl('stripe',
      new FormGroup({
        'url': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(200),
            Validators.pattern(Constants.URL_PATTERN)
          ])
        ),
        'secretKey': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
            //  StripeToolBox.validateSecretKey
          ]),
        ),
        'publicKey': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
            StripeToolBox.validatePublicKey
          ])
        ),
        'immediateBillingAllowed': new FormControl(''),
        'periodicBillingAllowed': new FormControl(''),
      })
    );
    // Keep
    this.stripe = <FormGroup>this.formGroup.controls['stripe'];
    this.stripeUrl = this.stripe.controls['url'];
    this.stripeSecretKey = this.stripe.controls['secretKey'];
    this.stripePublicKey = this.stripe.controls['publicKey'];
    this.stripeImmediateBillingAllowed = this.stripe.controls['immediateBillingAllowed'];
    this.stripePeriodicBillingAllowed = this.stripe.controls['periodicBillingAllowed'];
    // Set data
    this.updateFormData(true);
  }

  ngOnChanges() {
    this.updateFormData();

  }

  updateFormData(firstTime = false) {
    // Set data
    if (this.stripe) {
      this.stripeUrl.setValue(this.billingSettings.stripe.url ? this.billingSettings.stripe.url : '');
      //      if (firstTime) {
      this.stripeSecretKey.setValue(this.billingSettings.stripe.secretKey ? this.billingSettings.stripe.secretKey : '');
      //      }
      this.stripePublicKey.setValue(this.billingSettings.stripe.publicKey ? this.billingSettings.stripe.publicKey : '');
      this.stripeImmediateBillingAllowed.setValue(this.billingSettings.stripe.immediateBillingAllowed
        ? this.billingSettings.stripe.immediateBillingAllowed : '');
      this.stripePeriodicBillingAllowed.setValue(this.billingSettings.stripe.periodicBillingAllowed
        ? this.billingSettings.stripe.periodicBillingAllowed : '');
    }
  }

  openUrl() {
    window.open(this.stripeUrl.value);
  }
}
