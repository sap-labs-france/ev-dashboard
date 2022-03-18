import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  @Input() public formGroup: FormGroup;
  @Input() public asset!: Asset;
  @Input() public readOnly: boolean;

  public assetConnections!: KeyValue[];

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
  ) {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('connectionID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('dynamicAsset', new FormControl(false,
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('usesPushAPI', new FormControl(false));
    this.formGroup.addControl('meterID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    // Form
    this.dynamicAsset = this.formGroup.controls['dynamicAsset'];
    this.usesPushAPI = this.formGroup.controls['usesPushAPI'];
    this.connectionID = this.formGroup.controls['connectionID'];
    this.meterID = this.formGroup.controls['meterID'];
    // Disable connection form by default
    this.disableConnectionDetails();
    if (this.readOnly) {
      this.formGroup.disable();
    }
    // Load Connection
    this.loadAssetConnection();
  }

  public ngOnChanges() {
    this.loadAsset();
  }

  public loadAsset() {
    if (this.asset) {
      if (this.asset.dynamicAsset) {
        this.formGroup.controls.dynamicAsset.setValue(this.asset.dynamicAsset);
        this.formGroup.controls.usesPushAPI.setValue(this.asset.usesPushAPI);
        this.disableConnectionDetails();
      }
      if (this.asset.connectionID) {
        this.formGroup.controls.connectionID.setValue(this.asset.connectionID);
      }
      if (this.asset.meterID) {
        this.formGroup.controls.meterID.setValue(this.asset.meterID);
      }
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
  }

  public disableConnectionDetails() {
    if (Utils.convertToBoolean(this.dynamicAsset.value && !Utils.convertToBoolean(this.usesPushAPI.value))) {
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
    this.componentService.getAssetSettings().subscribe((assetSettings) => {
      this.spinnerService.hide();
      if (assetSettings) {
        const connections = [] as KeyValue[];
        for (const connection of assetSettings.asset.connections) {
          connections.push({ key: connection.id, value: connection.name });
        }
        this.assetConnections = connections;
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService,
        this.centralServerService, 'assets.asset_settings_error');
    });
  }
}
