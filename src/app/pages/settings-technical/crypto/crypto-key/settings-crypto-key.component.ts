import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CryptoSettings } from '../../../../types/Setting';

@Component({
  selector: 'app-settings-crypto-key',
  templateUrl: 'settings-crypto-key.component.html',
})
export class SettingsCryptoKeyComponent implements OnInit, OnChanges {
  @Input() public formGroup!: FormGroup;
  @Input() public cryptoSettings!: CryptoSettings;
  @Input() public authorizations!: SettingAuthorizationActions;

  public cryptoKey!: FormGroup;
  public key!: AbstractControl;
  public blockCypher!: AbstractControl;
  public blockSize!: AbstractControl;
  public operationMode!: AbstractControl;

  public ngOnInit(): void {
    this.cryptoKey = new FormGroup({
      key: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(32),
        ])
      ),
      blockCypher: new FormControl('', Validators.compose([Validators.required])),
      blockSize: new FormControl('', Validators.compose([Validators.required])),
      operationMode: new FormControl('', Validators.compose([Validators.required])),
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
    // Read only
    if (!this.authorizations.canUpdate) {
      // Async call for letting the sub form groups to init
      setTimeout(() => this.formGroup.disable(), 0);
    }
  }
}
