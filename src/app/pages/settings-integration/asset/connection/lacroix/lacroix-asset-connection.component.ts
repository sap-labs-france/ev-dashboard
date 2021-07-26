import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { AssetLacroixConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-lacroix-connection',
  templateUrl: './lacroix-asset-connection.component.html'
})
export class LacroixAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: FormGroup;
  @Input() public lacroixConnection!: AssetLacroixConnectionType;

  public lacroixLoginForm!: FormGroup;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.lacroixLoginForm = new FormGroup({
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
      this.formGroup.addControl('lacroixConnection', this.lacroixLoginForm);
    } else {
      this.lacroixLoginForm.disable();
    }
    this.user = this.lacroixLoginForm.controls['user'];
    this.password = this.lacroixLoginForm.controls['password'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.lacroixConnection) {
      if (this.lacroixConnection.user) {
        this.lacroixLoginForm.controls.user.setValue(this.lacroixConnection.user);
      }
      if (this.lacroixConnection.password) {
        this.lacroixLoginForm.controls.password.setValue(this.lacroixConnection.password);
      }
    }
  }
}
