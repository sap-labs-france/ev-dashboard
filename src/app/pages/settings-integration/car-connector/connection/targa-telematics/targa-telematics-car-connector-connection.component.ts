import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Constants } from 'utils/Constants';

import { CarConnectorTargaTelematicsConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-targa-telematics-connection',
  templateUrl: 'targa-telematics-car-connector-connection.component.html',
})
export class TargaTelematicsCarConnectorConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public targaTelematicsConnection!: CarConnectorTargaTelematicsConnectionType;

  public targaTelematicsCredentials!: UntypedFormGroup;
  public authenticationUrl!: AbstractControl;
  public apiUrl!: AbstractControl;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.targaTelematicsCredentials = new UntypedFormGroup({
      authenticationUrl: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      apiUrl: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      clientId: new UntypedFormControl('', Validators.compose([Validators.required])),
      clientSecret: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('targaTelematicsConnection', this.targaTelematicsCredentials);
    } else {
      this.targaTelematicsCredentials.disable();
    }
    this.authenticationUrl = this.targaTelematicsCredentials.controls['authenticationUrl'];
    this.apiUrl = this.targaTelematicsCredentials.controls['apiUrl'];
    this.clientId = this.targaTelematicsCredentials.controls['clientId'];
    this.clientSecret = this.targaTelematicsCredentials.controls['clientSecret'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.targaTelematicsConnection) {
      if (this.targaTelematicsConnection.authenticationUrl) {
        this.targaTelematicsCredentials.controls.authenticationUrl.setValue(
          this.targaTelematicsConnection.authenticationUrl
        );
      }
      if (this.targaTelematicsConnection.apiUrl) {
        this.targaTelematicsCredentials.controls.apiUrl.setValue(
          this.targaTelematicsConnection.apiUrl
        );
      }
      if (this.targaTelematicsConnection.clientId) {
        this.targaTelematicsCredentials.controls.clientId.setValue(
          this.targaTelematicsConnection.clientId
        );
      }
      if (this.targaTelematicsConnection.clientSecret) {
        this.targaTelematicsCredentials.controls.clientSecret.setValue(
          this.targaTelematicsConnection.clientSecret
        );
      }
    }
  }
}
