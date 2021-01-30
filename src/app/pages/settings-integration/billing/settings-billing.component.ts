import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableSyncBillingInvoicesAction } from '../../../shared/table/actions/invoices/table-sync-billing-invoices-action';
import { TableSyncBillingUsersAction } from '../../../shared/table/actions/users/table-sync-billing-users-action';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { BillingSettings, BillingSettingsType } from '../../../types/Setting';
import TenantComponents from '../../../types/TenantComponents';
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

  public ngOnInit(): void {
    // Build the form
    this.formGroup = new FormGroup({});
    // Load the conf
    this.loadConfiguration();
  }

  public loadConfiguration() {
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
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
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
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
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
    this.centralServerService.checkBillingConnection().subscribe((response) => {
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

  public synchronizeInvoices() {
    const actionDef = new TableSyncBillingInvoicesAction().getActionDef();
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
