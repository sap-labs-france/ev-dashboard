import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RefundSettings, RefundSettingsType } from 'app/types/Setting';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-refund',
  templateUrl: 'settings-refund.component.html',
})
export class SettingsRefundComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public refundSettings!: RefundSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(ComponentType.REFUND);
  }

  ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new FormGroup({});
      // Load the conf
      this.loadConfiguration();
    }
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getRefundSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.refundSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.refund.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
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
    this.componentService.saveRefundSettings(this.refundSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.refundSettings.id ? 'settings.refund.create_success' : 'settings.refund.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.refundSettings.id ? 'settings.refund.create_error' : 'settings.refund.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.refund.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.refundSettings.id ? 'settings.refund.create_error' : 'settings.refund.update_error'));
      }
    });
  }

  public synchronize() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.refund.synchronize_dialog_refund_title'),
      this.translateService.instant('settings.refund.synchronize_dialog_refund_confirm'),
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        this.messageService.showInfoMessage('settings.refund.synchronize_started');
        this.centralServerService.synchronizeRefundedTransactions().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('settings.refund.synchronize_success');
            this.refresh();
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), this.messageService, 'settings.refund.synchronize_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.refund.synchronize_error');
        });
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
