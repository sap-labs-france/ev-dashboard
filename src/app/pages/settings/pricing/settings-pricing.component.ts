import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { PricingSettings, PricingSettingsType } from 'app/types/Setting';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-pricing',
  templateUrl: 'settings-pricing.component.html',
})
export class SettingsPricingComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public pricingSettings!: PricingSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(ComponentType.PRICING);
  }

  ngOnInit(): void {
    // Build the form
    this.formGroup = new FormGroup({});
    // Load the conf
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getPricingSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.pricingSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content: PricingSettings) {
    // Convergent Charging
    if (content.convergentCharging) {
      this.pricingSettings.type = PricingSettingsType.CONVERGENT_CHARGING;
      this.pricingSettings.convergentCharging = content.convergentCharging;
    // Simple
    } else if (content.simple) {
      this.pricingSettings.type = PricingSettingsType.SIMPLE;
      this.pricingSettings.simple = content.simple;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.savePricingSettings(this.pricingSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.pricingSettings.id ? 'settings.pricing.create_success' : 'settings.pricing.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.pricingSettings.id ? 'settings.pricing.create_error' : 'settings.pricing.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.pricing.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.pricingSettings.id ? 'settings.pricing.create_error' : 'settings.pricing.update_error'));
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
