import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { AssetSchneiderConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-schneider-connection',
  templateUrl: './schneider-asset-connection.component.html'
})
export class SchneiderAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: FormGroup;
  @Input() public connection!: AssetSchneiderConnectionType;

  public schneiderLoginForm!: FormGroup;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.schneiderLoginForm = new FormGroup({
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
      this.formGroup.addControl('connection', this.schneiderLoginForm);
    } else {
      this.schneiderLoginForm.disable();
    }
    this.user = this.schneiderLoginForm.controls['user'];
    this.password = this.schneiderLoginForm.controls['password'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.connection) {
      if (this.connection.user) {
        this.schneiderLoginForm.controls.user.setValue(this.connection.user);
      }
      if (this.connection.password) {
        this.schneiderLoginForm.controls.password.setValue(this.connection.password);
      }
    }
  }
}
