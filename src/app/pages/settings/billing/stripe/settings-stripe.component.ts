import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingSettings, Tax } from 'app/common.types';
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
  public taxes: Tax[] = [];
  public taxCountry: AbstractControl;
  public taxCode: AbstractControl;

  ngOnInit() {
    this.stripe =
      new FormGroup({
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
            //  StripeToolBox.validateSecretKey
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
        taxCountry: new FormControl('',
          Validators.compose([
            Validators.required,
          ]),
        ),
        taxCode: new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(20),
            StripeToolBox.validateTaxCode,
          ]),
        ),
      });
    // Keep
    this.stripeUrl = this.stripe.controls['url'];
    this.stripeSecretKey = this.stripe.controls['secretKey'];
    this.stripePublicKey = this.stripe.controls['publicKey'];
    this.stripeImmediateBillingAllowed = this.stripe.controls['immediateBillingAllowed'];
    this.stripePeriodicBillingAllowed = this.stripe.controls['periodicBillingAllowed'];
    this.stripeLastSynchronizedOn = this.stripe.controls['lastSynchronizedOn'];
    this.taxCountry = this.stripe.controls['taxCountry'];
    this.taxCountry.setValue('none');
    this.taxCode = this.stripe.controls['taxCode'];
    this.taxCode.disable();

    // Set data
    this.updateFormData(true);
    this.onChanges();
  }

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getCountryTaxes().subscribe((taxes) => {
      this.taxes = taxes.result;
    });
  }

  ngOnChanges() {
    this.updateFormData();
  }

  onChanges() {
    this.stripe.get('taxCountry').valueChanges.subscribe((selectedTax) => {
      console.log(selectedTax);
      if (selectedTax === 'none') {
        this.stripe.get('taxCode').reset();
        this.stripe.get('taxCode').disable();
      } else {
        this.stripe.get('taxCode').enable();
      }
    });
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
      this.stripeLastSynchronizedOn.setValue(this.billingSettings.stripe.lastSynchronizedOn
        ? this.billingSettings.stripe.lastSynchronizedOn : '');
    }
  }

  openUrl() {
    window.open(this.stripeUrl.value);
  }
}
