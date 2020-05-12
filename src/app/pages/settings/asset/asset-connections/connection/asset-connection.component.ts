import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { KeyValue } from 'app/types/GlobalType';
import { AssetConnectionSetting, AssetConnectionSettingTypes, AssetSettings } from 'app/types/Setting';
import { Constants } from 'app/utils/Constants';
import { AssetConnectionDialogComponent } from './asset-connection.dialog.component';

@Component({
  selector: 'app-settings-asset-connection',
  templateUrl: './asset-connection.component.html'
})
export class AssetConnectionComponent implements OnInit {
  @Input() public currentAssetConnection!: Partial<AssetConnectionSetting>;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<AssetConnectionDialogComponent>;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;
  public url!: AbstractControl;
  public user!: AbstractControl;
  public password!: AbstractControl;

  public assetConnectionTypes: KeyValue[];

  constructor(
    private dialogService: DialogService,
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
      user: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      password: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    this.url = this.formGroup.controls['url'];
    this.user = this.formGroup.controls['user'];
    this.password = this.formGroup.controls['password'];
    // Listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // Check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
      if (keydownEvents && keydownEvents.code === 'Enter') {
        // tslint:disable-next-line: no-unsafe-any
        this.setConnectionAndClose(this.formGroup.value);
      }
    });
  }

  public saveConnectionButtonTranslation() {
    if (!this.currentAssetConnection.id) {
      return this.translateService.instant('general.create');
    }
    return this.translateService.instant('general.update');
  }

  public cancel() {
    this.dialogRef.close();
  }

  public setConnectionAndClose(assetSettings: AssetSettings) {
    this.dialogRef.close(assetSettings);
  }
}
