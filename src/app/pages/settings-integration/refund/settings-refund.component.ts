import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableSyncRefundTransactionsAction } from '../../../shared/table/actions/transactions/table-sync-refund-transactions-action';
import { RestResponse } from '../../../types/GlobalType';
import { RefundSettings, RefundSettingsType } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-refund',
  templateUrl: 'settings-refund.component.html',
})
export class SettingsRefundComponent implements OnInit {
  public isActive = false;

  public formGroup!: UntypedFormGroup;
  public refundSettings!: RefundSettings;
  public authorizations: SettingAuthorizationActions;
  private tableSyncRefundAction = new TableSyncRefundTransactionsAction().getActionDef();

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.REFUND);
  }

  public ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new UntypedFormGroup({});
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getRefundSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
          canSyncRefund: Utils.convertToBoolean(settings.canSyncRefund),
        };
        // Keep
        this.refundSettings = settings;
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'settings.refund.setting_not_found'
            );
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

  public save(content: RefundSettings) {
    // Concur
    if (content.concur) {
      this.refundSettings.type = RefundSettingsType.CONCUR;
      this.refundSettings.concur = content.concur;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.saveRefundSettings(this.refundSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            !this.refundSettings.id
              ? 'settings.refund.create_success'
              : 'settings.refund.update_success'
          );
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            !this.refundSettings.id
              ? 'settings.refund.create_error'
              : 'settings.refund.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.refund.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              !this.refundSettings.id
                ? 'settings.refund.create_error'
                : 'settings.refund.update_error'
            );
        }
      },
    });
  }

  public synchronize() {
    if (this.tableSyncRefundAction.action) {
      this.tableSyncRefundAction.action(
        this.dialogService,
        this.translateService,
        this.messageService,
        this.centralServerService,
        this.spinnerService,
        this.router
      );
    }
  }

  public refresh() {
    this.loadConfiguration();
  }
}
