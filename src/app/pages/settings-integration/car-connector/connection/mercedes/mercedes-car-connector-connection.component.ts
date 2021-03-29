import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'utils/Constants';

import { CarConnectorMercedesConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-mercedes-connection',
  templateUrl: './mercedes-car-connector-connection.component.html'
})
export class MercedesCarConnectorConnectionComponent implements OnInit {
  @Input() public formGroup!: FormGroup;
  @Input() public mercedesConnection!: CarConnectorMercedesConnectionType;

  public mercedesCredentials!: FormGroup;
  public authenticationUrl!: AbstractControl;
  public apiUrl!: AbstractControl;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.mercedesCredentials = new FormGroup({
      authenticationUrl: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      apiUrl: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      clientId: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      clientSecret: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('mercedesConnection', this.mercedesCredentials);
    } else {
      this.mercedesCredentials.disable();
    }
    this.authenticationUrl = this.mercedesCredentials.controls['authenticationUrl'];
    this.apiUrl = this.mercedesCredentials.controls['apiUrl'];
    this.clientId = this.mercedesCredentials.controls['clientId'];
    this.clientSecret = this.mercedesCredentials.controls['clientSecret'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.mercedesConnection) {
      if (this.mercedesConnection.apiUrl) {
        this.mercedesCredentials.controls.apiUrl.setValue(this.mercedesConnection.apiUrl);
      }
      if (this.mercedesConnection.authenticationUrl) {
        this.mercedesCredentials.controls.authenticationUrl.setValue(this.mercedesConnection.authenticationUrl);
      }
      if (this.mercedesConnection.clientId) {
        this.mercedesCredentials.controls.clientId.setValue(this.mercedesConnection.clientId);
      }
      if (this.mercedesConnection.clientSecret) {
        this.mercedesCredentials.controls.clientSecret.setValue(this.mercedesConnection.clientSecret);
      }
    }
  }
}
