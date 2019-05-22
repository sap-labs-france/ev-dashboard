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

@Component({
  selector: 'app-settings-pricing',
  templateUrl: 'settings-pricing.component.html'
})
export class SettingsPricingComponent implements OnInit {
  public isAdmin;
  public formGroupConvergentCharging: FormGroup;
  public formGroupSimple: FormGroup;
  public isActive = false;

  public simplePricing: FormGroup;
  public price: AbstractControl;
  public currency: AbstractControl;
  public convergentCharging: FormGroup;
  public convergentChargingUrl: AbstractControl;
  public convergentChargingChargeableItemName: AbstractControl;
  public convergentChargingUser: AbstractControl;
  public convergentChargingPassword: AbstractControl;
  public pricingSettings: PricingSettings;

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
    // Convergent Charging pricing
    this.formGroupConvergentCharging = new FormGroup({
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
    this.convergentCharging = <FormGroup>this.formGroupConvergentCharging.controls['convergentCharging'];
    this.convergentChargingUrl = this.convergentCharging.controls['url'];
    this.convergentChargingChargeableItemName = this.convergentCharging.controls['chargeableItemName'];
    this.convergentChargingUser = this.convergentCharging.controls['user'];
    this.convergentChargingPassword = this.convergentCharging.controls['password'];
    // Simple pricing
    this.formGroupSimple = new FormGroup({
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
    this.simplePricing = <FormGroup>this.formGroupSimple.controls['simple'];
    this.price = this.simplePricing.controls['price'];
    this.currency = this.simplePricing.controls['currency'];
    // Load the conf
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getPricingSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.pricingSettings = settings;
      // Init with settings
      if (this.pricingSettings) {
        // Convergeant Charging
        if (this.pricingSettings.type === PricingSettingsType.convergentCharging && this.pricingSettings.convergentCharging) {
          this.convergentChargingUrl.setValue(this.pricingSettings.convergentCharging.url);
          this.convergentChargingChargeableItemName.setValue(this.pricingSettings.convergentCharging.chargeableItemName);
          this.convergentChargingUser.setValue(this.pricingSettings.convergentCharging.user);
          this.convergentChargingPassword.setValue(this.pricingSettings.convergentCharging.password);
        // Simple
        } else if (this.pricingSettings.type === PricingSettingsType.simple && this.pricingSettings.simple) {
          this.price.setValue(this.pricingSettings.simple.price);
          this.currency.setValue(this.pricingSettings.simple.currency);
        }
      }
      // Init forms
      this.formGroupConvergentCharging.markAsPristine();
      this.formGroupSimple.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    // Convergent Charging
    if (content.convergentCharging) {
      this.pricingSettings.convergentCharging = content.convergentCharging;
      this.pricingSettings.type = PricingSettingsType.convergentCharging;
    // Simple
    } else if (content.simple) {
      this.pricingSettings.simple = content.simple;
      this.pricingSettings.type = PricingSettingsType.simple;
    } else {
      return;
    }
    // Save
    this.spinnerService.show();
    this.componentService.savePricingSettings(this.pricingSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.pricingSettings.id ? 'settings.pricing.create_success' : 'settings.pricing.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.pricingSettings.id ? 'settings.pricing.create_error' : 'settings.pricing.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.pricing.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.pricingSettings.id ? 'settings.pricing.create_error' : 'settings.pricing.update_error'));
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
