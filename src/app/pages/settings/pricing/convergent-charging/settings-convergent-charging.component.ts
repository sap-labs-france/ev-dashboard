import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {PricingSettings} from 'app/common.types';

@Component({
  selector: 'app-settings-convergent-charging',
  templateUrl: 'settings-convergent-charging.component.html'
})
export class SettingsConvergentChargingComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() pricingSettings: PricingSettings;

  public convergentChargingUrl: AbstractControl;
  public convergentChargingChargeableItemName: AbstractControl;
  public convergentChargingUser: AbstractControl;
  public convergentChargingPassword: AbstractControl;

  ngOnInit(): void {
    // Convergent Charging pricing
    const convergentCharging = new FormGroup({
      'url': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      ),
      'chargeableItemName': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      ),
      'user': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      ),
      'password': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      )
    });
    // Add
    this.formGroup.addControl('convergentCharging', convergentCharging);
    // Keep
    this.convergentChargingUrl = convergentCharging.controls['url'];
    this.convergentChargingChargeableItemName = convergentCharging.controls['chargeableItemName'];
    this.convergentChargingUser = convergentCharging.controls['user'];
    this.convergentChargingPassword = convergentCharging.controls['password'];
    // Set
    this.convergentChargingUrl.setValue(this.pricingSettings.convergentCharging.url);
    this.convergentChargingChargeableItemName.setValue(this.pricingSettings.convergentCharging.chargeableItemName);
    this.convergentChargingUser.setValue(this.pricingSettings.convergentCharging.user);
    this.convergentChargingPassword.setValue(this.pricingSettings.convergentCharging.password);
  }
}
