import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import { RefundSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-refund',
  templateUrl: 'settings-refund.component.html'
})
export class SettingsRefundComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public isActive = false;

  public concur: FormGroup;
  public concurAuthenticationUrl: AbstractControl;
  public concurApiUrl: AbstractControl;
  public concurClientId: AbstractControl;
  public concurClientSecret: AbstractControl;
  public concurPaymentTypeId: AbstractControl;
  public concurExpenseTypeCode: AbstractControl;
  public concurPolicyId: AbstractControl;
  public concurReportName: AbstractControl;

  private refundSettings: RefundSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(ComponentEnum.REFUND);
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'concur': new FormGroup({
        'authenticationUrl': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'apiUrl': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'clientId': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'clientSecret': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'paymentTypeId': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'expenseTypeCode': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'policyId': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
        'reportName': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100)
          ])
        ),
      })
    });

    this.concur = <FormGroup>this.formGroup.controls['concur'];
    this.concurAuthenticationUrl = this.concur.controls['authenticationUrl'];
    this.concurApiUrl = this.concur.controls['apiUrl'];
    this.concurClientId = this.concur.controls['clientId'];
    this.concurClientSecret = this.concur.controls['clientSecret'];
    this.concurPaymentTypeId = this.concur.controls['paymentTypeId'];
    this.concurExpenseTypeCode = this.concur.controls['expenseTypeCode'];
    this.concurPolicyId = this.concur.controls['policyId'];
    this.concurReportName = this.concur.controls['reportName'];

    this.loadConfiguration();
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getRefundSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Init form
      this.formGroup.markAsPristine();
      // Keep
      this.refundSettings = settings;
      // takes the first one
      if (settings && settings.concur) {
        this.concurAuthenticationUrl.setValue(settings.concur.authenticationUrl ? settings.concur.authenticationUrl : '');
        this.concurApiUrl.setValue(settings.concur.apiUrl ? settings.concur.apiUrl : '');
        this.concurClientId.setValue(settings.concur.clientId ? settings.concur.clientId : '');
        this.concurClientSecret.setValue(settings.concur.clientSecret ? settings.concur.clientSecret : '');
        this.concurPaymentTypeId.setValue(settings.concur.paymentTypeId ? settings.concur.paymentTypeId : '');
        this.concurExpenseTypeCode.setValue(settings.concur.expenseTypeCode ? settings.concur.expenseTypeCode : '');
        this.concurPolicyId.setValue(settings.concur.policyId ? settings.concur.policyId : '');
        this.concurReportName.setValue(settings.concur.reportName ? settings.concur.reportName : '');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.refund.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    // Set the content
    this.refundSettings[Object.keys(content)[0]] = content[Object.keys(content)[0]];
    // Save
    this.spinnerService.show();
    this.componentService.saveRefundSetting(this.refundSettings).subscribe((response) => {
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

  public refresh() {
    this.loadConfiguration();
  }
}
