import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { DialogService } from 'services/dialog.service';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../types/GlobalType';
import { PricingSettings, PricingSettingsType } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-pricing',
  templateUrl: 'settings-pricing.component.html',
})
export class SettingsPricingComponent implements OnInit {
  public isActive = false;
  public authorizations: SettingAuthorizationActions;
  public formGroup!: FormGroup;
  public pricingSettings!: PricingSettings;
  public isCurrencyCodeReadonly = false;
  public showSimplePricing = false;
  public showPricingDefinitions = false;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.PRICING);
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
    this.componentService.getPricingSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        // Keep
        this.pricingSettings = settings;
        // Check Settings
        this.checkSettingsContext(settings);
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.pricing.not_found');
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

  public checkSettingsContext(settings: PricingSettings) {
    if (settings?.type === PricingSettingsType.SIMPLE) {
      // Show the Simple pricing Form
      this.showSimplePricing = true;
      // Get the current currency code from the user token
      const currentCurrencyCode = this.centralServerService.getCurrencyCode();
      // Currency code cannot be changed once it is set
      this.isCurrencyCodeReadonly = !!currentCurrencyCode;
      // Show Pricing Definitions - only shown when the currency code is set
      this.showPricingDefinitions = this.showSimplePricing && this.isCurrencyCodeReadonly;
      // Check the User Token
      if (settings?.simple.currency && currentCurrencyCode !== settings?.simple.currency) {
        // Not in sync - Currency has been change by another user
        // TODO: Force logout?
      }
    }
  }

  public save(content: PricingSettings) {
    // Built-in Pricing
    if (content.simple) {
      this.pricingSettings.type = PricingSettingsType.SIMPLE;
      this.pricingSettings.simple = content.simple;
    } else {
      return;
    }
    if (
      content.simple &&
      !!content.simple.currency &&
      content.simple.currency !== this.centralServerService.getCurrencyCode()
    ) {
      // Ask for confirmation
      this.dialogService
        .createAndShowYesNoDialog(
          this.translateService.instant('settings.pricing.pricing_currency_changed_title'),
          this.translateService.instant('settings.pricing.pricing_currency_changed_confirm')
        )
        .subscribe((response) => {
          if (response === ButtonAction.YES) {
            this.savePricingSettings();
          }
        });
    } else {
      // Do not ask for confirmation
      this.savePricingSettings();
    }
  }

  public refresh() {
    this.loadConfiguration();
  }

  private savePricingSettings() {
    // Save
    this.spinnerService.show();
    this.componentService.savePricingSettings(this.pricingSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            !this.pricingSettings.id
              ? 'settings.pricing.create_success'
              : 'settings.pricing.update_success'
          );
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            !this.pricingSettings.id
              ? 'settings.pricing.create_error'
              : 'settings.pricing.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.pricing.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              !this.pricingSettings.id
                ? 'settings.pricing.create_error'
                : 'settings.pricing.update_error'
            );
        }
      },
    });
  }
}
