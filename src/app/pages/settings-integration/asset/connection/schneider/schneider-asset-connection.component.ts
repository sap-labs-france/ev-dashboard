import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { AssetSchneiderConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-schneider-connection',
  templateUrl: 'schneider-asset-connection.component.html',
})
export class SchneiderAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public schneiderConnection!: AssetSchneiderConnectionType;

  public schneiderLoginForm!: UntypedFormGroup;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.schneiderLoginForm = new UntypedFormGroup({
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      password: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('schneiderConnection', this.schneiderLoginForm);
    } else {
      this.schneiderLoginForm.disable();
    }
    this.user = this.schneiderLoginForm.controls['user'];
    this.password = this.schneiderLoginForm.controls['password'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.schneiderConnection) {
      if (this.schneiderConnection.user) {
        this.schneiderLoginForm.controls.user.setValue(this.schneiderConnection.user);
      }
      if (this.schneiderConnection.password) {
        this.schneiderLoginForm.controls.password.setValue(this.schneiderConnection.password);
      }
    }
  }
}
