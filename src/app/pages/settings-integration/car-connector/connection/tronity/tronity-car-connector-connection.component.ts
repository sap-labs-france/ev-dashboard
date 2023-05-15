import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Constants } from 'utils/Constants';

import { CarConnectorTronityConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-tronity-connection',
  templateUrl: 'tronity-car-connector-connection.component.html',
})
export class TronityCarConnectorConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public tronityConnection!: CarConnectorTronityConnectionType;

  public tronityCredentials!: UntypedFormGroup;
  public apiUrl!: AbstractControl;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.tronityCredentials = new UntypedFormGroup({
      apiUrl: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      clientId: new UntypedFormControl('', Validators.compose([Validators.required])),
      clientSecret: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('tronityConnection', this.tronityCredentials);
    } else {
      this.tronityCredentials.disable();
    }
    this.apiUrl = this.tronityCredentials.controls['apiUrl'];
    this.clientId = this.tronityCredentials.controls['clientId'];
    this.clientSecret = this.tronityCredentials.controls['clientSecret'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.tronityConnection) {
      if (this.tronityConnection.apiUrl) {
        this.tronityCredentials.controls.apiUrl.setValue(this.tronityConnection.apiUrl);
      }
      if (this.tronityConnection.clientId) {
        this.tronityCredentials.controls.clientId.setValue(this.tronityConnection.clientId);
      }
      if (this.tronityConnection.clientSecret) {
        this.tronityCredentials.controls.clientSecret.setValue(this.tronityConnection.clientSecret);
      }
    }
  }
}
