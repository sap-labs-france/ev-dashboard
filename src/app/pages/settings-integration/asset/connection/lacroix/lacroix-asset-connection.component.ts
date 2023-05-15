import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { AssetLacroixConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-lacroix-connection',
  templateUrl: 'lacroix-asset-connection.component.html',
})
export class LacroixAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public lacroixConnection!: AssetLacroixConnectionType;

  public lacroixLoginForm!: UntypedFormGroup;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.lacroixLoginForm = new UntypedFormGroup({
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      password: new UntypedFormControl('', Validators.compose([Validators.required])),
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
