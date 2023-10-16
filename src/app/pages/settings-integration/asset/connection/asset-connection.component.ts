import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogMode } from 'types/Authorization';
import { Utils } from 'utils/Utils';

import { KeyValue } from '../../../../types/GlobalType';
import {
  AssetConnectionSetting,
  AssetConnectionType,
  AssetGreencomConnectionType,
  AssetIothinkConnectionType,
  AssetLacroixConnectionType,
  AssetSchneiderConnectionType,
  AssetWitConnectionType,
} from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';
import { AssetConnectionDialogComponent } from './asset-connection.dialog.component';

@Component({
  selector: 'app-settings-asset-connection',
  templateUrl: 'asset-connection.component.html',
  styleUrls: ['asset-connection.component.scss'],
})
export class AssetConnectionComponent implements OnInit {
  @Input() public currentAssetConnection!: AssetConnectionSetting;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<AssetConnectionDialogComponent>;
  @Input() public dialogMode!: DialogMode;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;
  public url!: AbstractControl;
  public refreshIntervalMins!: AbstractControl;

  public schneiderConnection!: AssetSchneiderConnectionType;
  public greencomConnection!: AssetGreencomConnectionType;
  public iothinkConnection!: AssetIothinkConnectionType;
  public witConnection!: AssetWitConnectionType;
  public lacroixConnection!: AssetLacroixConnectionType;
  public assetConnectionTypes: KeyValue[] = [
    { key: AssetConnectionType.SCHNEIDER, value: 'settings.asset.types.schneider' },
    { key: AssetConnectionType.GREENCOM, value: 'settings.asset.types.greencom' },
    { key: AssetConnectionType.IOTHINK, value: 'settings.asset.types.iothink' },
    { key: AssetConnectionType.WIT, value: 'settings.asset.types.wit' },
    { key: AssetConnectionType.LACROIX, value: 'settings.asset.types.lacroix' },
  ];
  public submitButtonTranslation!: any;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private translateService: TranslateService) {}

  public ngOnInit(): void {
    // Init Form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      description: new FormControl('', Validators.compose([Validators.required])),
      type: new FormControl<AssetConnectionType>(
        AssetConnectionType.NONE,
        Validators.compose([Validators.required])
      ),
      url: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
      refreshIntervalMins: new FormControl<number>(1, Validators.compose([Validators.min(1)])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    this.url = this.formGroup.controls['url'];
    this.refreshIntervalMins = this.formGroup.controls['refreshIntervalMins'];
    this.loadAssetConnection();
    // Create / Update button translation
    this.submitButtonTranslation = this.getSubmitButtonTranslation();
    // Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadAssetConnection(): void {
    if (this.currentAssetConnection) {
      this.id.setValue(this.currentAssetConnection.id);
      if (this.currentAssetConnection.name) {
        this.name.setValue(this.currentAssetConnection.name);
      }
      if (this.currentAssetConnection.description) {
        this.description.setValue(this.currentAssetConnection.description);
      }
      if (this.currentAssetConnection.type) {
        this.type.setValue(this.currentAssetConnection.type);
        this.loadConnectionType();
      }
      if (this.currentAssetConnection.url) {
        this.url.setValue(this.currentAssetConnection.url);
      }
      if (this.currentAssetConnection.refreshIntervalMins) {
        this.refreshIntervalMins.setValue(this.currentAssetConnection.refreshIntervalMins);
      }
    }
  }

  public loadConnectionType(): void {
    switch (this.currentAssetConnection.type) {
      case AssetConnectionType.SCHNEIDER:
        this.schneiderConnection = this.currentAssetConnection.schneiderConnection;
        break;
      case AssetConnectionType.GREENCOM:
        this.greencomConnection = this.currentAssetConnection.greencomConnection;
        break;
      case AssetConnectionType.IOTHINK:
        this.iothinkConnection = this.currentAssetConnection.iothinkConnection;
        break;
      case AssetConnectionType.WIT:
        this.witConnection = this.currentAssetConnection.witConnection;
        break;
      case AssetConnectionType.LACROIX:
        this.lacroixConnection = this.currentAssetConnection.lacroixConnection;
        break;
    }
  }

  public getSubmitButtonTranslation(): string {
    if (this.currentAssetConnection && this.currentAssetConnection.id) {
      return this.translateService.instant('general.update');
    }
    return this.translateService.instant('general.create');
  }

  public close(): void {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }

  public save(assetConnection: AssetConnectionSetting): void {
    if (this.inDialog) {
      // Generate the ID
      if (!assetConnection.id) {
        assetConnection.id = new Date().getTime().toString();
      }
      this.dialogRef.close(assetConnection);
    }
  }

  public typeChanged(type: AssetConnectionType) {
    if (this.greencomConnection && type !== AssetConnectionType.GREENCOM) {
      delete this.greencomConnection;
    }
    if (this.schneiderConnection && type !== AssetConnectionType.SCHNEIDER) {
      delete this.schneiderConnection;
    }
    if (this.iothinkConnection && type !== AssetConnectionType.IOTHINK) {
      delete this.iothinkConnection;
    }
    if (this.witConnection && type !== AssetConnectionType.WIT) {
      delete this.witConnection;
    }
    if (this.lacroixConnection && type !== AssetConnectionType.LACROIX) {
      delete this.lacroixConnection;
    }
  }
}
