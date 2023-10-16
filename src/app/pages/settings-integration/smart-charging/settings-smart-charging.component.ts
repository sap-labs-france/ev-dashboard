import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { SmartChargingSettings, SmartChargingSettingsType } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-smart-charging',
  templateUrl: 'settings-smart-charging.component.html',
})
export class SettingsSmartChargingComponent implements OnInit {
  public isActive = false;
  public formGroup!: FormGroup;
  public smartChargingSettings!: SmartChargingSettings;
  public authorizations: SettingAuthorizationActions;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
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
    this.componentService.getSmartChargingSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
          canCheckSmartChargingConnection: Utils.convertToBoolean(
            settings.canCheckSmartChargingConnection
          ),
        };
        // Keep
        this.smartChargingSettings = settings;
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.smart_charging.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      },
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
    this.componentService.saveSmartChargingSettings(this.smartChargingSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            !this.smartChargingSettings.id
              ? 'settings.smart_charging.create_success'
              : 'settings.smart_charging.update_success'
          );
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            !this.smartChargingSettings.id
              ? 'settings.smart_charging.create_error'
              : 'settings.smart_charging.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.smart_charging.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              !this.smartChargingSettings.id
                ? 'settings.smart_charging.create_error'
                : 'settings.smart_charging.update_error'
            );
        }
      },
    });
  }

  public checkConnection() {
    this.spinnerService.show();
    this.centralServerService.checkSmartChargingConnection().subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('settings.smart_charging.connection_success');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'settings.smart_charging.connection_error'
        );
      },
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
