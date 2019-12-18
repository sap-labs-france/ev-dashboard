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
  public taxes: PartialBillingTax[] = [];
  public taxCountry: AbstractControl;
  public taxCode: AbstractControl;

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

    this.formGroup.addControl('stripe', this.stripe);

    // Keep
    this.stripeUrl = (this.formGroup.get('stripe') as FormGroup).controls['url'];
    this.stripeSecretKey = (this.formGroup.get('stripe') as FormGroup).controls['secretKey'];
    this.stripePublicKey = (this.formGroup.get('stripe') as FormGroup).controls['publicKey'];
    this.stripeImmediateBillingAllowed = (this.formGroup.get('stripe') as FormGroup).controls['immediateBillingAllowed'];
    this.stripePeriodicBillingAllowed = (this.formGroup.get('stripe') as FormGroup).controls['periodicBillingAllowed'];
    this.stripeLastSynchronizedOn = (this.formGroup.get('stripe') as FormGroup).controls['lastSynchronizedOn'];
    this.taxCountry = (this.formGroup.get('stripe') as FormGroup).controls['taxCountry'];
    this.taxCountry.setValue('none');
    this.taxCode = (this.formGroup.get('stripe') as FormGroup).controls['taxCode'];
    this.taxCode.disable();

    // Set data
    this.updateFormData(true);
    this.onChanges();
  }

  constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getBillingTaxes().subscribe((taxes) => {
      this.taxes = taxes;
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
  }

  openUrl() {
    window.open(this.stripeUrl.value);
  }
}
