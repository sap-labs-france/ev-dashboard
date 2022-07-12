import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { CryptoSettings } from '../../../../types/Setting';

@Component({
  selector: 'app-settings-crypto-key',
  templateUrl: 'settings-crypto-key.component.html',
})
export class SettingsCryptoKeyComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public cryptoSettings!: CryptoSettings;

  public cryptoKey!: UntypedFormGroup;
  public key!: AbstractControl;
  public blockCypher!: AbstractControl;
  public blockSize!: AbstractControl;
  public operationMode!: AbstractControl;

  public ngOnInit(): void {
    this.cryptoKey = new UntypedFormGroup({
      key: new UntypedFormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(32),
        ])
      ),
      blockCypher: new UntypedFormControl('', Validators.compose([Validators.required])),
      blockSize: new UntypedFormControl('', Validators.compose([Validators.required])),
      operationMode: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    // Add
    this.formGroup.addControl('crypto', this.cryptoKey);
    // Keep
    this.key = this.cryptoKey.controls['key'];
    this.blockCypher = this.cryptoKey.controls['blockCypher'];
    this.blockSize = this.cryptoKey.controls['blockSize'];
    this.operationMode = this.cryptoKey.controls['operationMode'];
    // Set data
    this.updateFormData();
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public updateFormData() {
    // Set data
    if (this.cryptoSettings?.crypto && this.cryptoKey) {
      this.key.setValue(this.cryptoSettings.crypto.key);
      this.blockCypher.setValue(this.cryptoSettings.crypto.keyProperties.blockCypher);
      this.blockSize.setValue(this.cryptoSettings.crypto.keyProperties.blockSize);
      this.operationMode.setValue(this.cryptoSettings.crypto.keyProperties.operationMode);
      this.formGroup.markAsPristine();
    }
  }
}
