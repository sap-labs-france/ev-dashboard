import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SmartChargingSettings, SmartChargingSettingsType } from 'app/common.types';
import { Constants } from 'app/utils/Constants';

@Component({
  selector: 'app-settings-sapSmartCharging',
  templateUrl: 'settings-sapSmartCharging.component.html',
})
export class SettingsSapSmartChargingComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() smartChargingSettings: SmartChargingSettings;

  public optimizerUrl: AbstractControl;

  ngOnInit(): void {
    // Add control
    this.formGroup.addControl(
      'optimizerUrl', new FormControl('',
        Validators.compose([
          Validators.pattern(Constants.URL_PATTERN),
        ])),
    );
    this.optimizerUrl = this.formGroup.controls['optimizerUrl'];
    // Set data
    this.updateFormData();
  }

  ngOnChanges() {
    this.updateFormData();
  }

  updateFormData() {
    // Set data
    if (this.optimizerUrl) {
      this.optimizerUrl.setValue(this.smartChargingSettings.sapSmartCharging.optimizerUrl);
      this.formGroup.markAsPristine();
    }
  }
}
