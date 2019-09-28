import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { PricingSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-simple-pricing',
  templateUrl: 'settings-simple-pricing.component.html',
})
export class SettingsSimplePricingComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() pricingSettings: PricingSettings;

  public simplePricing: FormGroup;
  public price: AbstractControl;
  public currency: AbstractControl;

  ngOnInit(): void {
    // Simple pricing
    this.simplePricing = new FormGroup({
      price: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?((\d+(\.\d+)?))$/),
          Validators.maxLength(10),
        ]),
      ),
      currency: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
        ]),
      ),
    });
    // Add
    this.formGroup.addControl('simple', this.simplePricing);
    // Keep
    this.price = this.simplePricing.controls['price'];
    this.currency = this.simplePricing.controls['currency'];
    // Set
    this.updateFormData();
  }

  ngOnChanges() {
    this.updateFormData();
  }

  updateFormData() {
    // Set data
    if (this.simplePricing) {
      this.price.setValue(this.pricingSettings.simple.price);
      this.currency.setValue(this.pricingSettings.simple.currency);
    }
  }
}
