import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { KeyValue } from '../../../../types/GlobalType';
import { AssetConnectionSetting, AssetConnectionType, AssetSchneiderConnectionType } from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';
import { AssetConnectionDialogComponent } from './asset-connection.dialog.component';

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

  public connection!: AssetSchneiderConnectionType;
  public assetConnectionTypes: KeyValue[] = [
    { key: AssetConnectionType.SCHNEIDER, value: 'settings.asset.types.schneider' }
  ];
  public submitButtonTranslation!: any;

  constructor(
    private translateService: TranslateService) {
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
    // Get Create/Update button translation
    this.submitButtonTranslation = this.getSubmitButtonTranslation();
  }

  public loadAssetConnection(): void {
    if (this.currentAssetConnection) {
      this.formGroup.controls.id.setValue(this.currentAssetConnection.id);
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
    }
  }

  public loadConnectionType(): void {
    switch (this.currentAssetConnection.type) {
      case AssetConnectionType.SCHNEIDER:
        this.connection = this.currentAssetConnection.connection;
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

  public setConnectionAndClose(assetConnection: AssetConnectionSetting): void {
    if (this.inDialog) {
      // Generate the ID
      if (!assetConnection.id) {
        assetConnection.id = new Date().getTime().toString();
      }
      this.dialogRef.close(assetConnection);
    }
  }
}
