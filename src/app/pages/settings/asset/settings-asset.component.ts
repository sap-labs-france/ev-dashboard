import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService } from 'app/services/component.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { AssetSettings } from 'app/types/Setting';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';

import { SettingsAssetConnectionEditableTableDataSource } from './settings-asset-connections-list-table-data-source';

@Component({
  selector: 'app-settings-asset',
  templateUrl: './settings-asset.component.html',
})
export class SettingsAssetComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public assetConnections!: FormArray;

  public assetSettings!: AssetSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    public assetConnectionListTableDataSource: SettingsAssetConnectionEditableTableDataSource) {
    this.isActive = this.componentService.isActive(TenantComponents.ASSET);
  }

  public ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new FormGroup({
        assetConnections: new FormArray([]),
      });
      // Form Controls
      this.assetConnections = this.formGroup.controls['assetConnections'] as FormArray;
      // Assign connections form to data source
      this.assetConnectionListTableDataSource.setFormArray(this.assetConnections);
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getAssetSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.assetSettings = settings;
      // Set
      this.assetConnectionListTableDataSource.setContent(this.assetSettings.asset.connections);
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.asset.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save() {
    // Assign connections
    this.assetSettings.asset.connections = this.assetConnectionListTableDataSource.getContent();
    // Save
    this.spinnerService.show();
    this.componentService.saveAssetConnectionSettings(this.assetSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.assetSettings.id ? 'settings.asset.create_success' : 'settings.asset.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.assetSettings.id ? 'settings.asset.create_error' : 'settings.asset.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.asset.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.assetSettings.id ? 'settings.asset.create_error' : 'settings.asset.update_error'));
      }
    });
  }

  public refresh() {
    // Reload settings
    this.loadConfiguration();
  }
}
