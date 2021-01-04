import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { CryptoSettings } from '../../../../types/Setting';

@Component({
    selector: 'app-crypto-key',
    templateUrl: 'crypto-key.component.html',
})
export class CryptoKeyComponent implements OnInit, OnChanges {
    @Input() public formGroup!: FormGroup;
    @Input() public cryptoSettings!: CryptoSettings;

    public cryptoKey!: FormGroup;
    public key!: AbstractControl;

    public ngOnInit(): void {
        this.cryptoKey = new FormGroup({
            key: new FormControl('',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(100),
                ]),
            )
        });
        // Add
        this.formGroup.addControl('crypto', this.cryptoKey);
        // Keep
        this.key = this.cryptoKey.controls['key'];
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
            this.formGroup.markAsPristine();
        }
    }
}
