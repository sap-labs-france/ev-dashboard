import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { PricingSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-simple-pricing',
  templateUrl: 'settings-simple-pricing.component.html'
})
export class SettingsSimplePricingComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() pricingSettings: PricingSettings;

  public price: AbstractControl;
  public currency: AbstractControl;

  ngOnInit(): void {
    // Simple pricing
    const simplePricing = new FormGroup({
      'price': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?((\d+(\.\d+)?))$/),
          Validators.maxLength(10)
        ])
      ),
      'currency': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(3)
        ])
      )
    });
    // Add
    this.formGroup.addControl('simple', simplePricing);
    // Keep
    this.price = simplePricing.controls['price'];
    this.currency = simplePricing.controls['currency'];
    // Set
    this.price.setValue(this.pricingSettings.simple.price);
    this.currency.setValue(this.pricingSettings.simple.currency);
  }
}
