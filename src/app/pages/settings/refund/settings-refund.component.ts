import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {ComponentEnum, ComponentService} from '../../../services/component.service';

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

  private currentSettingID;

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
    this.centralServerService.getSettings(ComponentEnum.REFUND).subscribe((setting) => {
      this.spinnerService.hide();

      // takes the first one
      if (setting && setting.count > 0 && setting.result[0].content) {
        const config = setting.result[0].content;
        this.currentSettingID = setting.result[0].id;

        if (config.concur) {
          this.concurAuthenticationUrl.setValue(config.concur.authenticationUrl ? config.concur.authenticationUrl : '');
          this.concurApiUrl.setValue(config.concur.apiUrl ? config.concur.apiUrl : '');
          this.concurClientId.setValue(config.concur.clientId ? config.concur.clientId : '');
          this.concurClientSecret.setValue(config.concur.clientSecret ? config.concur.clientSecret : '');
          this.concurPaymentTypeId.setValue(config.concur.paymentTypeId ? config.concur.paymentTypeId : '');
          this.concurExpenseTypeCode.setValue(config.concur.expenseTypeCode ? config.concur.expenseTypeCode : '');
          this.concurPolicyId.setValue(config.concur.policyId ? config.concur.policyId : '');
          this.concurReportName.setValue(config.concur.reportName ? config.concur.reportName : '');
        }
      }
      this.formGroup.markAsPristine();

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
    if (this.currentSettingID) {
      this._updateConfiguration(content);
    } else {
      this.createConfiguration(content);
    }
  }

  public refresh() {
    this.loadConfiguration();
  }

  private _updateConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.currentSettingID,
      'identifier': ComponentEnum.REFUND,
      'content': content
    };

    this.spinnerService.show();
    this.centralServerService.updateSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.refund.update_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.refund.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.refund.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.refund.update_error');
      }
    });
  }

  private createConfiguration(content) {
    // build setting payload
    const setting = {
      'id': null,
      'identifier': ComponentEnum.REFUND,
      'content': content
    };
    this.spinnerService.show();
    this.centralServerService.createSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.refund.create_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.refund.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.refund.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.refund.create_error');
      }
    });
  }
}
