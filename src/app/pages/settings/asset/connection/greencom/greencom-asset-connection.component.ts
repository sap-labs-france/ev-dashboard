import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { AssetGreencomConnectionType } from '../../../../../types/Setting';

@Component({
  selector: 'app-settings-greencom-connection',
  templateUrl: './greencom-asset-connection.component.html'
})
export class GreencomAssetConnectionComponent implements OnInit {
  @Input() public formGroup!: FormGroup;
  @Input() public greencomConnection!: AssetGreencomConnectionType;

  public greencomCredentials!: FormGroup;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.greencomCredentials = new FormGroup({
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
      this.formGroup.addControl('greencomConnection', this.greencomCredentials);
    } else {
      this.greencomCredentials.disable();
    }
    this.clientId = this.greencomCredentials.controls['clientId'];
    this.clientSecret = this.greencomCredentials.controls['clientSecret'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.greencomConnection) {
      if (this.greencomConnection.clientId) {
        this.greencomCredentials.controls.clientId.setValue(this.greencomConnection.clientId);
      }
      if (this.greencomConnection.clientSecret) {
        this.greencomCredentials.controls.clientSecret.setValue(this.greencomConnection.clientSecret);
      }
    }
  }
}
