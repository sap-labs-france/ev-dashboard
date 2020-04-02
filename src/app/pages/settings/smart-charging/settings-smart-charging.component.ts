import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { SmartChargingSettings, SmartChargingSettingsType } from 'app/types/Setting';
import TenantComponents from 'app/types/TenantComponents';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-smart-charging',
  templateUrl: 'settings-smart-charging.component.html',
})
export class SettingsSmartChargingComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public smartChargingSettings!: SmartChargingSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  ngOnInit(): void {
    // Build the form
    this.formGroup = new FormGroup({});
    // Load the conf
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getSmartChargingSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.smartChargingSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.smartCharging.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content: SmartChargingSettings) {
    // SAP Smart Charging
    if (content.sapSmartCharging) {
      this.smartChargingSettings.type = SmartChargingSettingsType.SAP_SMART_CHARGING;
      this.smartChargingSettings.sapSmartCharging = content.sapSmartCharging;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.saveSmartChargingSettings(this.smartChargingSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.smartChargingSettings.id ? 'settings.smartCharging.create_success' : 'settings.smartCharging.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.smartChargingSettings.id ? 'settings.smartCharging.create_error' : 'settings.smartCharging.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.smartCharging.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.smartChargingSettings.id ? 'settings.smartCharging.create_error' : 'settings.smartCharging.update_error'));
      }
    });
  }

  public checkConnection() {
    this.spinnerService.show();
    this.centralServerService.checkSmartChargingConnection().subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('settings.smartCharging.check_connection_success');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.smartCharging.check_connection_error', {response: JSON.stringify(error.details)});
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
