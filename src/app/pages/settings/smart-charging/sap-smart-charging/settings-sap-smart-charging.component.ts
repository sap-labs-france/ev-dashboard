import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SmartChargingSettings } from 'app/types/Setting';
import { Constants } from 'app/utils/Constants';

@Component({
  selector: 'app-settings-sap-smart-charging',
  templateUrl: 'settings-sap-smart-charging.component.html',
})
export class SettingsSapSmartChargingComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Input() smartChargingSettings!: SmartChargingSettings;

  public sapSmartCharging!: FormGroup;
  public optimizerUrl!: AbstractControl;
  public user!: AbstractControl;
  public password!: AbstractControl;

  ngOnInit(): void {
    this.sapSmartCharging = new FormGroup({
      optimizerUrl: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ]),
      ),
      user: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ),
      password: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ),
    });
    // Add
    this.formGroup.addControl('sapSmartCharging', this.sapSmartCharging);
    // Keep
    this.optimizerUrl = this.sapSmartCharging.controls['optimizerUrl'];
    this.user = this.sapSmartCharging.controls['user'];
    this.password = this.sapSmartCharging.controls['password'];
    // Set data
    this.updateFormData();
  }

  ngOnChanges() {
    this.updateFormData();
  }

  updateFormData() {
    // Set data
    if (this.smartChargingSettings && this.smartChargingSettings.sapSmartCharging) {
      this.optimizerUrl.setValue(this.smartChargingSettings.sapSmartCharging.optimizerUrl);
      this.user.setValue(this.smartChargingSettings.sapSmartCharging.user);
      this.password.setValue(this.smartChargingSettings.sapSmartCharging.password);
      this.formGroup.markAsPristine();
    }
  }
}
