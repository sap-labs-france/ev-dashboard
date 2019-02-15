import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-settings-pricing',
  templateUrl: 'settings-pricing.component.html'
})
export class SettingsPricingComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public isActive = false;

  public simplePricing: FormGroup;
  public price: AbstractControl;
  public currency: AbstractControl;
  public convergentCharging: FormGroup;
  public convergentChargingUrl: AbstractControl;
  public convergentChargingUser: AbstractControl;
  public convergentChargingPassword: AbstractControl;
  public pricingType: string = null;
  private currentSettingID;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = centralServerService.isComponentActive(Constants.SETTINGS_PRICING);
    this.pricingType = centralServerService.getActiveComponents().find(c => c.startsWith(Constants.SETTINGS_PRICING + '_'));
  }

  ngOnInit(): void {
    if (this.pricingType === 'pricing_convergentCharging') {
      this.formGroup = new FormGroup({
        'convergentCharging': new FormGroup({
          'url': new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(100)
            ])
          ),
          'user': new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(100)
            ])
          ),
          'password': new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(100)
            ])
          )
        })
      });
      this.convergentCharging = <FormGroup>this.formGroup.controls['convergentCharging'];
      this.convergentChargingUrl = this.convergentCharging.controls['url'];
      this.convergentChargingUser = this.convergentCharging.controls['user'];
      this.convergentChargingPassword = this.convergentCharging.controls['password'];
    } else if (this.pricingType === 'pricing_simple') {
      this.formGroup = new FormGroup({
        'simple': new FormGroup({
          'price': new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.pattern(/^-?((\d+(\.\d+)?))$/),
              Validators.maxLength(10)
            ])
          ),
          'currency': new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(3)
            ])
          )
        })
      });
      this.simplePricing = <FormGroup>this.formGroup.controls['simple'];
      this.price = this.simplePricing.controls['price'];
      this.currency = this.simplePricing.controls['currency'];
    }
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.centralServerService.getSettings(Constants.SETTINGS_PRICING).subscribe((setting) => {
      this.spinnerService.hide();

      // takes the first one
      if (setting && setting.count > 0 && setting.result[0].content) {
        const config = setting.result[0].content;
        this.currentSettingID = setting.result[0].id;

        if (this.pricingType === 'pricing_convergentCharging' && config.convergentCharging) {
          this.convergentChargingUrl.setValue(config.convergentCharging.url ? config.convergentCharging.url : '');
          this.convergentChargingUser.setValue(config.convergentCharging.user ? config.convergentCharging.user : '');
          this.convergentChargingPassword.setValue(config.convergentCharging.password ? config.convergentCharging.password : '');
        } else if (this.pricingType === 'pricing_simple' && config.simple) {
          this.price.setValue(config.simple.price ? config.simple.price : '');
          this.currency.setValue(config.simple.currency ? config.simple.currency : '');
        }
      }
      this.formGroup.markAsPristine();

    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.setting_not_found');
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

  public refresh() {
    this.loadConfiguration();
  }

  private _updateConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.currentSettingID,
      'identifier': Constants.SETTINGS_PRICING,
      'content': content
    };

    this.spinnerService.show();
    this.centralServerService.updateSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.pricing.update_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.pricing.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.pricing.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.update_error');
      }
    });
  }

  private _createConfiguration(content) {
    // build setting payload
    const setting = {
      'id': null,
      'identifier': Constants.SETTINGS_PRICING,
      'content': content
    };
    this.spinnerService.show();
    this.centralServerService.createSetting(setting).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('settings.pricing.create_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.pricing.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.pricing.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.create_error');
      }
    });
  }
}
