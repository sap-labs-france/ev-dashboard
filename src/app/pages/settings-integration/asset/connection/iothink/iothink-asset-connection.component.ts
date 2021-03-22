import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { AssetIothinkConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-iothink-connection',
  templateUrl: './iothink-asset-connection.component.html'
})
export class IothinkAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: FormGroup;
  @Input() public iothinkConnection!: AssetIothinkConnectionType;

  public iothinkLoginForm!: FormGroup;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.iothinkLoginForm = new FormGroup({
      user: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      password: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('iothinkConnection', this.iothinkLoginForm);
    } else {
      this.iothinkLoginForm.disable();
    }
    this.user = this.iothinkLoginForm.controls['user'];
    this.password = this.iothinkLoginForm.controls['password'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.iothinkConnection) {
      if (this.iothinkConnection.user) {
        this.iothinkLoginForm.controls.user.setValue(this.iothinkConnection.user);
      }
      if (this.iothinkConnection.password) {
        this.iothinkLoginForm.controls.password.setValue(this.iothinkConnection.password);
      }
    }
  }
}
