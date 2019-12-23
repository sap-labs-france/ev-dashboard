import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BillingSettings, BillingSettingsType } from 'app/common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-billing',
  templateUrl: 'settings-billing.component.html',
})
export class SettingsBillingComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public billingSettings!: BillingSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(ComponentType.BILLING);
  }

  ngOnInit(): void {
    // Build the form
    this.formGroup = new FormGroup({});
    // Load the conf
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getBillingSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.billingSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content: BillingSettings) {
    // Stripe
    if (content.stripe) {
      this.billingSettings.stripe = content.stripe;
      this.billingSettings.type = BillingSettingsType.STRIPE;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.saveBillingSettings(this.billingSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.billingSettings.id ? 'settings.billing.create_success' : 'settings.billing.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.billingSettings.id ? 'settings.billing.create_error' : 'settings.billing.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.billingSettings.id ? 'settings.billing.create_error' : 'settings.billing.update_error'));
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }

  public checkConnection() {
    this.spinnerService.show();
    this.centralServerService.validateBillingConnection().subscribe((response) => {
      this.spinnerService.hide();
      if (response.connectionIsValid) {
        this.messageService.showSuccessMessage('settings.billing.connection_success');
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.billing.connection_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'settings.billing.connection_error');
    });
  }

  public synchronizeUsers() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.billing.synchronize_users_dialog_title'),
      this.translateService.instant('settings.billing.synchronize_users_dialog_confirm'),
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        this.messageService.showInfoMessage('settings.billing.synchronize_users_started');
        this.centralServerService.synchronizeUsersForBilling().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === Constants.REST_RESPONSE_SUCCESS) {
            if (synchronizeResponse.synchronized) {
              this.messageService.showSuccessMessage(this.translateService.instant('settings.billing.synchronize_users_success',
                {number: synchronizeResponse.synchronized}));
            } else if (!synchronizeResponse.error) {
              this.messageService.showSuccessMessage(this.translateService.instant('settings.billing.synchronize_users_success_all'));
            }
            if (synchronizeResponse.error) {
              this.messageService.showWarningMessage(this.translateService.instant('settings.billing.synchronize_users_failure',
                {number: synchronizeResponse.error}));
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), this.messageService, 'settings.billing.synchronize_users_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.billing.synchronize_users_error');
        });
      }
    });
  }

}
