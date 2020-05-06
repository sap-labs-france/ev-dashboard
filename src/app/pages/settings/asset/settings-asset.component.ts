import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService } from 'app/services/component.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AssetSettings } from 'app/types/Setting';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-settings-asset',
  templateUrl: './settings-asset.component.html',
})
export class SettingsAssetComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public assetSettings!: AssetSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router) {
    this.isActive = this.componentService.isActive(TenantComponents.ASSET);
  }

  public ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new FormGroup({});
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
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.asset.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(assetSettings: AssetSettings) {
  }

  public refresh() {
    // Reload settings
    this.loadConfiguration();
  }
}
