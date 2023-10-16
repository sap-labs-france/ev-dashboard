import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Constants } from 'utils/Constants';

import { AssetWitConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-wit-connection',
  templateUrl: 'wit-asset-connection.component.html',
})
export class WitAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public witConnection!: AssetWitConnectionType;

  public witLoginForm!: UntypedFormGroup;
  public authenticationUrl!: AbstractControl;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.witLoginForm = new UntypedFormGroup({
      authenticationUrl: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      clientId: new UntypedFormControl('', Validators.compose([Validators.required])),
      clientSecret: new UntypedFormControl('', Validators.compose([Validators.required])),
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      password: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('witConnection', this.witLoginForm);
    } else {
      this.witLoginForm.disable();
    }
    this.authenticationUrl = this.witLoginForm.controls['authenticationUrl'];
    this.clientId = this.witLoginForm.controls['clientId'];
    this.clientSecret = this.witLoginForm.controls['clientSecret'];
    this.user = this.witLoginForm.controls['user'];
    this.password = this.witLoginForm.controls['password'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.witConnection) {
      if (this.witConnection.authenticationUrl) {
        this.witLoginForm.controls.authenticationUrl.setValue(this.witConnection.authenticationUrl);
      }
      if (this.witConnection.clientId) {
        this.witLoginForm.controls.clientId.setValue(this.witConnection.clientId);
      }
      if (this.witConnection.clientSecret) {
        this.witLoginForm.controls.clientSecret.setValue(this.witConnection.clientSecret);
      }
      if (this.witConnection.user) {
        this.witLoginForm.controls.user.setValue(this.witConnection.user);
      }
      if (this.witConnection.password) {
        this.witLoginForm.controls.password.setValue(this.witConnection.password);
      }
    }
  }
}
