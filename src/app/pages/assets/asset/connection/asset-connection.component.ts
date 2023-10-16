import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Asset } from '../../../../types/Asset';
import { KeyValue } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-asset-connection',
  templateUrl: 'asset-connection.component.html',
})
export class AssetConnectionComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public asset!: Asset;
  @Input() public readOnly: boolean;
  @Input() public assetsAuthorizations!: AssetsAuthorizations;

  public assetConnections!: KeyValue[];
  public initialized = false;

  public dynamicAsset!: AbstractControl;
  public usesPushAPI!: AbstractControl;
  public connectionID!: AbstractControl;
  public meterID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router
  ) {}

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl(
      'connectionID',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'dynamicAsset',
      new UntypedFormControl(false, Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('usesPushAPI', new UntypedFormControl(false));
    this.formGroup.addControl(
      'meterID',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    // Form
    this.dynamicAsset = this.formGroup.controls['dynamicAsset'];
    this.usesPushAPI = this.formGroup.controls['usesPushAPI'];
    this.connectionID = this.formGroup.controls['connectionID'];
    this.meterID = this.formGroup.controls['meterID'];
    // Disable connection form by default
    this.disableConnectionDetails();
    this.initialized = true;
    this.loadAssetConnection();
    this.loadAsset();
  }

  public ngOnChanges() {
    this.loadAsset();
  }

  public loadAsset() {
    if (this.initialized && this.asset) {
      if (this.asset.dynamicAsset) {
        this.dynamicAsset.setValue(this.asset.dynamicAsset);
        this.usesPushAPI.setValue(this.asset.usesPushAPI);
        this.disableConnectionDetails();
      }
      if (this.asset.connectionID) {
        this.connectionID.setValue(this.asset.connectionID);
      }
      if (this.asset.meterID) {
        this.meterID.setValue(this.asset.meterID);
      }
    }
  }

  public disableConnectionDetails() {
    if (
      Utils.convertToBoolean(
        this.dynamicAsset.value && !Utils.convertToBoolean(this.usesPushAPI.value)
      )
    ) {
      this.connectionID.enable();
      this.meterID.enable();
    } else {
      this.connectionID.disable();
      this.meterID.disable();
      this.connectionID.reset();
      this.meterID.reset();
    }
    if (!Utils.convertToBoolean(this.dynamicAsset.value)) {
      this.usesPushAPI.reset();
      this.usesPushAPI.disable();
    } else {
      this.usesPushAPI.enable();
    }
  }

  public loadAssetConnection() {
    this.spinnerService.show();
    this.componentService.getAssetSettings().subscribe({
      next: (assetSettings) => {
        this.spinnerService.hide();
        if (assetSettings) {
          const connections = [] as KeyValue[];
          for (const connection of assetSettings.asset.connections) {
            connections.push({ key: connection.id, value: connection.name });
          }
          this.assetConnections = connections;
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'assets.asset_settings_error'
        );
      },
    });
  }
}
