import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { SmartChargingSettings } from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';

@Component({
  selector: 'app-settings-sap-smart-charging',
  templateUrl: 'settings-sap-smart-charging.component.html',
})
export class SettingsSapSmartChargingComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public smartChargingSettings!: SmartChargingSettings;

  public sapSmartCharging!: UntypedFormGroup;
  public optimizerUrl!: AbstractControl;
  public user!: AbstractControl;
  public password!: AbstractControl;
  public stickyLimitation!: AbstractControl;
  public limitBufferDC!: AbstractControl;
  public limitBufferAC!: AbstractControl;

  public ngOnInit(): void {
    this.sapSmartCharging = new UntypedFormGroup({
      optimizerUrl: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ]),
      ),
      user: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ),
      password: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ),
      stickyLimitation: new UntypedFormControl(''),
      limitBufferDC: new UntypedFormControl(''),
      limitBufferAC: new UntypedFormControl(''),
    });
    // Add
    this.formGroup.addControl('sapSmartCharging', this.sapSmartCharging);
    // Keep
    this.optimizerUrl = this.sapSmartCharging.controls['optimizerUrl'];
    this.user = this.sapSmartCharging.controls['user'];
    this.password = this.sapSmartCharging.controls['password'];
    this.stickyLimitation = this.sapSmartCharging.controls['stickyLimitation'];
    this.limitBufferDC = this.sapSmartCharging.controls['limitBufferDC'];
    this.limitBufferAC = this.sapSmartCharging.controls['limitBufferAC'];
    // Set data
    this.updateFormData();
    if (!this.stickyLimitation.value) {
      this.limitBufferDC.disable();
      this.limitBufferAC.disable();
    }
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public stickyLimitationChanged() {
    if (this.stickyLimitation.value) {
      this.limitBufferDC.enable();
      this.limitBufferAC.enable();
    } else {
      this.limitBufferDC.disable();
      this.limitBufferAC.disable();
    }
  }

  public updateFormData() {
    // Set data
    if (this.smartChargingSettings && this.smartChargingSettings.sapSmartCharging && this.sapSmartCharging) {
      this.optimizerUrl.setValue(this.smartChargingSettings.sapSmartCharging.optimizerUrl ? this.smartChargingSettings.sapSmartCharging.optimizerUrl : '');
      this.user.setValue(this.smartChargingSettings.sapSmartCharging.user ? this.smartChargingSettings.sapSmartCharging.user : '');
      this.password.setValue(this.smartChargingSettings.sapSmartCharging.password ? this.smartChargingSettings.sapSmartCharging.password : '');
      this.stickyLimitation.setValue(this.smartChargingSettings.sapSmartCharging.stickyLimitation ? this.smartChargingSettings.sapSmartCharging.stickyLimitation : false);
      this.limitBufferDC.setValue(this.smartChargingSettings.sapSmartCharging.limitBufferDC ? this.smartChargingSettings.sapSmartCharging.limitBufferDC : 0);
      this.limitBufferAC.setValue(this.smartChargingSettings.sapSmartCharging.limitBufferAC ? this.smartChargingSettings.sapSmartCharging.limitBufferAC : 0);
      this.formGroup.markAsPristine();

    }
  }
}
