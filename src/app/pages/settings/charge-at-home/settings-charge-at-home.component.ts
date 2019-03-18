import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {ComponentEnum, ComponentService} from '../../../services/component.service';

@Component({
  selector: 'app-settings-charge-at-home',
  templateUrl: 'settings-charge-at-home.component.html'
})
export class SettingsChargeAtHomeComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public isActive = false;

  public concur: FormGroup;
  public concurUrl: AbstractControl;
  public concurClientId: AbstractControl;
  public concurClientSecret: AbstractControl;
  public concurPaymentTypeId: AbstractControl;
  public concurExpenseTypeCode: AbstractControl;

  private currentSettingID;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = componentService.isActive(ComponentEnum.CHARGE_AT_HOME);
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'concur': new FormGroup({
        'url': new FormControl('',
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
      })
    });

    this.concur = <FormGroup>this.formGroup.controls['concur'];
    this.concurUrl = this.concur.controls['url'];
    this.concurClientId = this.concur.controls['clientId'];
    this.concurClientSecret = this.concur.controls['clientSecret'];
    this.concurPaymentTypeId = this.concur.controls['paymentTypeId'];
    this.concurExpenseTypeCode = this.concur.controls['expenseTypeCode'];

    this.loadConfiguration();
  }

  loadConfiguration() {
    this.centralServerService.getSettings(Constants.SETTINGS_CHARGE_AT_HOME).subscribe((setting) => {
      this.spinnerService.hide();

      // takes the first one
      if (setting && setting.count > 0 && setting.result[0].content) {
        const config = setting.result[0].content;
        this.currentSettingID = setting.result[0].id;

        if (config.concur) {
          this.concurUrl.setValue(config.concur.url ? config.concur.url : '');
          this.concurClientId.setValue(config.concur.clientId ? config.concur.clientId : '');
          this.concurClientSecret.setValue(config.concur.clientSecret ? config.concur.clientSecret : '');
          this.concurPaymentTypeId.setValue(config.concur.paymentTypeId ? config.concur.paymentTypeId : '');
          this.concurExpenseTypeCode.setValue(config.concur.expenseTypeCode ? config.concur.expenseTypeCode : '');
        }
      }
      this.formGroup.markAsPristine();

    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.chargeathome.setting_not_found');
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
      this._createConfiguration(content);
    }
  }

  private _updateConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.currentSettingID,
      'identifier': Constants.SETTINGS_CHARGE_AT_HOME,
      'content': content
    };

    this.spinnerService.show();
    this.centralServerService.updateSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.chargeathome.update_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.chargeathome.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.chargeathome.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.chargeathome.update_error');
      }
    });
  }

  private _createConfiguration(content) {
    // build setting payload
    const setting = {
      'id': null,
      'identifier': Constants.SETTINGS_CHARGE_AT_HOME,
      'content': content
    };
    this.spinnerService.show();
    this.centralServerService.createSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.chargeathome.create_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.chargeathome.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.chargeathome.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.chargeathome.create_error');
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
