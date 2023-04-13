import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SettingAuthorizationActions } from '../../../../types/Authorization';
import { RestResponse } from '../../../../types/GlobalType';
import { ScanPaySettings, ScanPaySettingsType } from '../../../../types/Setting';
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-settings-scan-pay',
  templateUrl: 'settings-scan-pay.component.html',
})
export class SettingsScanPayComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public authorizations!: SettingAuthorizationActions;
  @Input() public scanPaySettings!: ScanPaySettings;
  @Input() public isBillingActive: boolean;
  @Input() public isPricingActive: boolean;

  public scanPay!: UntypedFormGroup;
  public amount!: AbstractControl;
  public isScanPayActive: boolean;

  public constructor(
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.isScanPayActive = this.componentService.isActive(TenantComponents.SCAN_PAY);
  }

  public ngOnInit() {
    if (this.isScanPayActive && this.isBillingActive && this.isPricingActive) {
      this.loadScanPayConfiguration();
    }
    this.scanPay = new UntypedFormGroup({
      amount: new UntypedFormControl('',
        Validators.compose([
          Validators.pattern(/^[+]?[0-9]+$/),
          Validators.required
        ])
      )
    });
    this.formGroup.addControl('scanPay', this.scanPay);
    this.amount = this.scanPay.controls['amount'];
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public loadScanPayConfiguration() {
    this.spinnerService.show();
    this.componentService.getScanPaySettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Keep
        this.scanPaySettings = settings;
        // Init form
        this.formGroup.markAsPristine();
        // Set data
        this.updateFormData();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.scan_pay.not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      }
    });
  }

  public save(newSettings: any) {
    this.scanPaySettings.type = ScanPaySettingsType.SCAN_PAY;
    if (newSettings?.scanPay?.amount) {
      this.scanPaySettings.content.scanPay.amount = newSettings.scanPay.amount;
    } else {
      this.messageService.showErrorMessage('settings.scan_pay.not_found');
    }
    // Save
    this.spinnerService.show();
    // Update scan & pay settings
    this.componentService.saveScanPaySettings(this.scanPaySettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            (!this.scanPaySettings.id ? 'settings.scan_pay.create_success' : 'settings.scan_pay.update_success'));
          this.refresh();
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, (!this.scanPaySettings.id ? 'settings.scan_pay.create_error' : 'settings.scan_pay.update_error'));
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.scan_pay.not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              (!this.scanPaySettings.id ? 'settings.scan_pay.create_error' : 'settings.scan_pay.update_error'));
        }
      }
    });
  }

  public refresh() {
    this.loadScanPayConfiguration();
  }

  private updateFormData() {
    if (!Utils.isEmptyObject(this.scanPaySettings?.content?.scanPay) && !Utils.isEmptyObject(this.formGroup.value)) {
      const scanPaySetting = this.scanPaySettings.content.scanPay;
      this.amount.setValue(scanPaySetting.amount || '');
      this.amount.markAsTouched();
    }
    // Read only
    if(!this.authorizations?.canSetScanPayAmount) {
      // Async call for letting the sub form groups to init
      setTimeout(() => this.formGroup.disable(), 0);
    }
  }
}
