import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RestResponse } from 'app/types/GlobalType';
import { BillingSettings, BillingSettingsType } from 'app/types/Setting';
import TenantComponents from 'app/types/TenantComponents';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableSyncBillingUsersAction } from '../../../shared/table/actions/table-sync-billing-users-action';
import { BillingConnectionErrorType } from '../../../types/Billing';
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
    this.isActive = this.componentService.isActive(TenantComponents.BILLING);
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
      this.billingSettings.type = BillingSettingsType.STRIPE;
      this.billingSettings.stripe = content.stripe;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.saveBillingSettings(this.billingSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
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
    this.centralServerService.CheckBillingConnection().subscribe((response) => {
      console.log(response);
      this.spinnerService.hide();
      if (response.connectionValid) {
        this.messageService.showSuccessMessage('settings.billing.connection_success');
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.billing.connection_error');
        switch (response.errorType) {
          case BillingConnectionErrorType.NO_SECRET_KEY:
            this.formGroup.get('stripe.secretKey').setErrors({ required: true });
            break;
          case BillingConnectionErrorType.INVALID_SECRET_KEY:
            this.formGroup.get('stripe.secretKey').setErrors({ invalid: true });
            break;
          case BillingConnectionErrorType.NO_PUBLIC_KEY:
            this.formGroup.get('stripe.publicKey').setErrors({ required: true });
            break;
          case BillingConnectionErrorType.INVALID_PUBLIC_KEY:
            this.formGroup.get('stripe.publicKey').setErrors({ invalid: true });
            break;
        }
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'settings.billing.connection_error');
    });
  }

  public synchronizeUsers() {
    const actionDef = new TableSyncBillingUsersAction().getActionDef();
    if (actionDef && actionDef.action) {
      actionDef.action(
        this.dialogService,
        this.translateService,
        this.messageService,
        this.centralServerService,
        this.router,
      );
    }
  }
}
