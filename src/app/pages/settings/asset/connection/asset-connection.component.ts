import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AssetConnectionSetting, AssetConnectionSettingTypes, AssetSettings, LoginCredentialsAssetConnection } from 'app/types/Setting';
import { Component, Input, OnInit } from '@angular/core';

import { AssetConnectionDialogComponent } from './asset-connection.dialog.component';
import { Constants } from 'app/utils/Constants';
import { KeyValue } from 'app/types/GlobalType';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-asset-connection',
  templateUrl: './asset-connection.component.html'
})
export class AssetConnectionComponent implements OnInit {
  @Input() public currentAssetConnection!: AssetConnectionSetting;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<AssetConnectionDialogComponent>;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;
  public url!: AbstractControl;

  public loginCredentials!: LoginCredentialsAssetConnection;
  public assetConnectionTypes!: KeyValue[];
  public submitButtonTranslation!: any;

  constructor(
    private translateService: TranslateService) {
    // Get asset connection types
    this.assetConnectionTypes = AssetConnectionSettingTypes;
  }

  public ngOnInit(): void {
    // Init Form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      description: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      type: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      url: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    this.url = this.formGroup.controls['url'];
    // Load current values if connection already exists
    this.loadAssetConnection();
    // Listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // Check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.cancel();
      }
      if (keydownEvents && keydownEvents.code === 'Enter') {
        if (this.formGroup.valid && this.formGroup.dirty) {
          // tslint:disable-next-line: no-unsafe-any
          this.setConnectionAndClose(this.formGroup.value);
        }
      }
    });
    // Get Create/Update button translation
    this.submitButtonTranslation = this.getSubmitButtonTranslation();
  }

  public loadAssetConnection(): void {
    if (!this.currentAssetConnection) {
      return;
    }
    if (this.currentAssetConnection.id) {
      this.formGroup.controls.id.setValue(this.currentAssetConnection.id);
    }
    if (this.currentAssetConnection.name) {
      this.formGroup.controls.name.setValue(this.currentAssetConnection.name);
    }
    if (this.currentAssetConnection.description) {
      this.formGroup.controls.description.setValue(this.currentAssetConnection.description);
    }
    if (this.currentAssetConnection.type) {
      this.formGroup.controls.type.setValue(this.currentAssetConnection.type);
      this.loadConnectionType();
    }
    if (this.currentAssetConnection.url) {
      this.formGroup.controls.url.setValue(this.currentAssetConnection.url);
    }
    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsPristine();
    this.formGroup.markAllAsTouched();
  }

  public loadConnectionType(): void {
    switch (this.currentAssetConnection.type) {
      case 'schneider':
        this.loginCredentials = this.currentAssetConnection.loginCredentials;
        break;
      default:
        break;
    }
  }

  public getSubmitButtonTranslation(): string {
    if (this.currentAssetConnection && this.currentAssetConnection.id) {
      return this.translateService.instant('general.update');
    }
    return this.translateService.instant('general.create');
  }

  public cancel(): void {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }

  public setConnectionAndClose(assetSettings: AssetSettings): void {
    if (this.inDialog) {
      this.dialogRef.close(assetSettings);
    }
  }
}
