import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import { PricingSettingsType, PricingSettings } from 'app/common.types';
import { Observable } from 'rxjs';

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
  public convergentChargingChargeableItemName: AbstractControl;
  public convergentChargingUser: AbstractControl;
  public convergentChargingPassword: AbstractControl;
  private pricingSettings: PricingSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(ComponentEnum.PRICING);
  }

  ngOnInit(): void {
    // Load the conf
    this.loadConfiguration().subscribe((settings) => {
      // Keep
      this.pricingSettings = settings;
      // Convergent Charging
      if (this.pricingSettings.type === PricingSettingsType.convergentCharging) {
        this.formGroup = new FormGroup({
          'convergentCharging': new FormGroup({
            'url': new FormControl('',
              Validators.compose([
                Validators.required,
                Validators.maxLength(100)
              ])
            ),
            'chargeableItemName': new FormControl('',
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
        this.convergentChargingChargeableItemName = this.convergentCharging.controls['chargeableItemName'];
        this.convergentChargingUser = this.convergentCharging.controls['user'];
        this.convergentChargingPassword = this.convergentCharging.controls['password'];
      // Simple pricing
      } else if (this.pricingSettings.type === PricingSettingsType.simple) {
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
      // Init with settings
      if (this.pricingSettings) {
        // Convergeant Charging
        if (this.pricingSettings.type === PricingSettingsType.convergentCharging && this.pricingSettings.convergentChargingPricing) {
          this.convergentChargingUrl.setValue(this.pricingSettings.convergentChargingPricing.url);
          this.convergentChargingChargeableItemName.setValue(this.pricingSettings.convergentChargingPricing.chargeableItemName);
          this.convergentChargingUser.setValue(this.pricingSettings.convergentChargingPricing.user);
          this.convergentChargingPassword.setValue(this.pricingSettings.convergentChargingPricing.password);
        // Simple
        } else if (this.pricingSettings.type === PricingSettingsType.simple && this.pricingSettings.simplePricing) {
          this.price.setValue(this.pricingSettings.simplePricing.price);
          this.currency.setValue(this.pricingSettings.simplePricing.currency);
        }
      }
    });
  }

  loadConfiguration(): Observable<PricingSettings> {
    return new Observable((observer) => {
      this.spinnerService.show();
      this.componentService.getPricingSettings().subscribe((settings) => {
        this.spinnerService.hide();
        if (this.formGroup) {
          this.formGroup.markAsPristine();
        }
        observer.next(settings);
        observer.complete();
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
        observer.error(error);
      });
    });
  }

  public save(content) {
    if (this.pricingSettings.id) {
      this._updateConfiguration(content);
    } else {
      this._createConfiguration(content);
    }
  }

  public refresh() {
    this.loadConfiguration().subscribe();
  }

  private _updateConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.pricingSettings.id,
      'identifier': ComponentEnum.PRICING,
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
      'identifier': ComponentEnum.PRICING,
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
