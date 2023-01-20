import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { GridMonitoringEcowattConnectionType } from 'types/Setting';
import { Constants } from 'utils/Constants';

@Component({
  selector: 'app-settings-ecowatt-connection',
  templateUrl: './ecowatt-grid-monitoring-connection.component.html',
})
export class EcowattGridMonitoringConnectionComponent implements OnInit {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public ecowattConnection!: GridMonitoringEcowattConnectionType;

  public ecowattCredentials!: UntypedFormGroup;
  public authenticationUrl!: AbstractControl;
  public clientId!: AbstractControl;
  public clientSecret!: AbstractControl;
  public levelGreenPercent!: AbstractControl;
  public levelOrangePercent!: AbstractControl;
  public levelRedPercent!: AbstractControl;

  public ngOnInit(): void {
    // Set login credentials form
    this.ecowattCredentials = new UntypedFormGroup({
      authenticationUrl: new FormControl('',
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
      levelGreenPercent: new FormControl(100,
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_PERCENTAGE_NUMBER),
        ])),
      levelOrangePercent: new FormControl(75,
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_PERCENTAGE_NUMBER),
        ])),
      levelRedPercent: new FormControl(50,
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_PERCENTAGE_NUMBER),
        ])),
    });
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('ecowattConnection', this.ecowattCredentials);
    } else {
      this.ecowattCredentials.disable();
    }
    this.authenticationUrl = this.ecowattCredentials.controls['authenticationUrl'];
    this.clientId = this.ecowattCredentials.controls['clientId'];
    this.clientSecret = this.ecowattCredentials.controls['clientSecret'];
    this.levelGreenPercent = this.ecowattCredentials.controls['levelGreenPercent'];
    this.levelOrangePercent = this.ecowattCredentials.controls['levelOrangePercent'];
    this.levelRedPercent = this.ecowattCredentials.controls['levelRedPercent'];
    // Load existing credentials
    this.loadCredentials();
  }

  public loadCredentials(): void {
    if (this.ecowattConnection) {
      if (this.ecowattConnection.authenticationUrl) {
        this.ecowattCredentials.controls.authenticationUrl.setValue(this.ecowattConnection.authenticationUrl);
      }
      if (this.ecowattConnection.clientId) {
        this.ecowattCredentials.controls.clientId.setValue(this.ecowattConnection.clientId);
      }
      if (this.ecowattConnection.clientSecret) {
        this.ecowattCredentials.controls.clientSecret.setValue(this.ecowattConnection.clientSecret);
      }
      if (this.ecowattConnection.levelGreenPercent) {
        this.ecowattCredentials.controls.levelGreenPercent.setValue(this.ecowattConnection.levelGreenPercent);
      }
      if (this.ecowattConnection.levelOrangePercent) {
        this.ecowattCredentials.controls.levelOrangePercent.setValue(this.ecowattConnection.levelOrangePercent);
      }
      if (this.ecowattConnection.levelRedPercent) {
        this.ecowattCredentials.controls.levelRedPercent.setValue(this.ecowattConnection.levelRedPercent);
      }
    }
  }
}
