import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { KeySettings } from '../../../../types/Setting';

@Component({
    selector: 'app-crypto-key',
    templateUrl: 'crypto-key.component.html',
})
export class CryptoKeyComponent implements OnInit, OnChanges {
    @Input() public formGroup!: FormGroup;
    @Input() public cryptoSettings!: KeySettings;

    public cryptoKey!: FormGroup;
    public key!: AbstractControl;
    public blockCypher!: AbstractControl;
    public keySize!: AbstractControl;
    public operationMode!: AbstractControl;
    
    public ngOnInit(): void {
        this.cryptoKey = new FormGroup({
            key: new FormControl('',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(16),
                    Validators.maxLength(32),
                ]),
            ),
            blockCypher: new FormControl('',
                Validators.compose([
                    Validators.required
                ]),
            ),
            keySize: new FormControl('',
                Validators.compose([
                    Validators.required
                ]),
            ),
            operationMode: new FormControl('',
                Validators.compose([
                    Validators.required
                ]),
            )            
        });
        // Add
        this.formGroup.addControl('crypto', this.cryptoKey);
        // Keep
        this.key = this.cryptoKey.controls['key'];
        this.blockCypher = this.cryptoKey.controls['blockCypher'];
        this.keySize = this.cryptoKey.controls['keySize'];
        this.operationMode = this.cryptoKey.controls['operationMode'];
        // Set data
        this.updateFormData();
    }

    public ngOnChanges() {
        this.updateFormData();
    }

    public updateFormData() {
        // Set data
        if (this.cryptoSettings && this.cryptoSettings.crypto && this.cryptoKey) {
            this.key.setValue(this.cryptoSettings.crypto.key);
            this.blockCypher.setValue(this.cryptoSettings.crypto.keySetting.blockCypher);
            this.keySize.setValue(this.cryptoSettings.crypto.keySetting.keySize);
            this.operationMode.setValue(this.cryptoSettings.crypto.keySetting.operationMode);
            this.formGroup.markAsPristine();
        }
    }
}
