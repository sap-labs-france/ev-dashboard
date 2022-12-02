import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { OcpiSetting, RoamingSettings, RoamingSettingsType } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-ocpi',
  templateUrl: 'settings-ocpi.component.html',
})
export class SettingsOcpiComponent implements OnInit {
  public isActive = false;
  public emspIsActive: boolean;
  public authorizations: SettingAuthorizationActions;

  public formGroup!: UntypedFormGroup;
  public logoGroup!: UntypedFormGroup;
  public cpoGroup!: UntypedFormGroup;

  public cpoCountryCode!: AbstractControl;
  public cpoPartyID!: AbstractControl;
  public cpoActive: AbstractControl;
  public emspCountryCode!: AbstractControl;
  public emspPartyID!: AbstractControl;
  public website!: AbstractControl;

  public name!: AbstractControl;
  public logoURL!: AbstractControl;
  public logoThumbnail!: AbstractControl;
  public logoCategory!: AbstractControl;
  public logoType!: AbstractControl;
  public logoWidth!: AbstractControl;
  public logoHeight!: AbstractControl;
  public currency!: AbstractControl;
  public tariffID!: AbstractControl;

  public ocpiSettings!: RoamingSettings;

  public logoTypes: any = [
    { key: '', description: '' },
    { key: 'jpg', description: 'JPG' },
    { key: 'png', description: 'PNG' },
    { key: 'svg', description: 'SVG' },
    { key: 'gif', description: 'GIF' },
  ];

  public logoCategories: any = [
    { key: 'CHARGER', description: 'Charger' },
    { key: 'ENTRANCE', description: 'Entrance' },
    { key: 'LOCATION', description: 'Location' },
    { key: 'NETWORK', description: 'Network' },
    { key: 'OPERATOR', description: 'Operator' },
    { key: 'OWNER', description: 'Owner' },
    { key: 'OTHER', description: 'Other' },
  ];

  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private router: Router) {
    this.isActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit() {
    if (this.isActive) {
      // build form
      this.formGroup = new UntypedFormGroup({
        businessDetails: new UntypedFormGroup({
          name: new UntypedFormControl(''),
          website: new UntypedFormControl('',
            Validators.pattern(Constants.URL_PATTERN)),
          logo: new UntypedFormGroup({
            url: new UntypedFormControl('',
              Validators.pattern(Constants.URL_PATTERN)),
            thumbnail: new UntypedFormControl(''),
            category: new UntypedFormControl(''),
            type: new UntypedFormControl(''),
            width: new UntypedFormControl(undefined,
              Validators.pattern(/^[0-9]*$/)),
            height: new UntypedFormControl(undefined,
              Validators.pattern(/^[0-9]*$/)),
          }),
        }),
        emsp: new UntypedFormGroup({
          countryCode: new UntypedFormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(2),
              Validators.minLength(2),
            ])),
          partyID: new UntypedFormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(3),
              Validators.minLength(3),
            ])),
        }),
        currency: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(3),
          ]),
        ),
        tariffID: new UntypedFormControl('',
          Validators.compose([
            Validators.maxLength(36),
          ]),
        ),
        cpoActive: new UntypedFormControl(false),
      });
      this.cpoGroup = new UntypedFormGroup({
        countryCode: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(2),
            Validators.minLength(2),
          ])),
        partyID: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(3),
            Validators.minLength(3),
          ])),
      });

      this.formGroup.addControl('cpo', this.cpoGroup);

      // CPO identifier
      this.cpoCountryCode = this.cpoGroup.controls['countryCode'];
      this.cpoPartyID = this.cpoGroup.controls['partyID'];
      this.cpoActive = this.formGroup.controls['cpoActive'];
      // EMSP identifier
      this.emspCountryCode = (this.formGroup.controls['emsp'] as UntypedFormGroup).controls['countryCode'];
      this.emspPartyID = (this.formGroup.controls['emsp'] as UntypedFormGroup).controls['partyID'];
      // business details - image
      this.name = (this.formGroup.controls['businessDetails'] as UntypedFormGroup).controls['name'];
      this.website = (this.formGroup.controls['businessDetails'] as UntypedFormGroup).controls['website'];
      this.logoGroup = ((this.formGroup.controls['businessDetails'] as UntypedFormGroup).controls['logo'] as UntypedFormGroup);
      this.logoURL = this.logoGroup.controls['url'];
      this.logoThumbnail = this.logoGroup.controls['thumbnail'];
      this.logoCategory = this.logoGroup.controls['category'];
      this.logoType = this.logoGroup.controls['type'];
      this.logoWidth = this.logoGroup.controls['width'];
      this.logoHeight = this.logoGroup.controls['height'];
      this.currency = this.formGroup.controls['currency'];
      this.tariffID = this.formGroup.controls['tariffID'];
      // Load the conf
      this.loadConfiguration();
    }
  }

  public enableDisableCPO(checked: boolean) {
    if (checked) {
      this.cpoGroup.enable();
      this.tariffID.enable();
    } else {
      this.cpoGroup.disable();
      this.tariffID.disable();
    }
    this.cpoGroup.markAsDirty();
  }

  public enableDisableEMSP(checked: boolean) {
    const emspFormGroup = this.formGroup.controls['emsp'] as UntypedFormGroup;
    if (checked) {
      emspFormGroup.enable();
    } else {
      emspFormGroup.disable();
    }
    emspFormGroup.markAsDirty();
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getOcpiSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init Auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        // Keep
        this.ocpiSettings = settings;
        // CPO identifier
        if (settings.ocpi.cpo) {
          this.cpoCountryCode.setValue(settings.ocpi.cpo.countryCode);
          this.cpoPartyID.setValue(settings.ocpi.cpo.partyID);
          this.cpoActive.setValue(this.cpoCountryCode.value && this.cpoPartyID.value);
        }
        this.enableDisableCPO(this.cpoActive.value);
        // EMSP identifier
        if (settings.ocpi.emsp) {
          this.emspCountryCode.setValue(settings.ocpi.emsp.countryCode);
          this.emspPartyID.setValue(settings.ocpi.emsp.partyID);
          this.emspIsActive = this.emspCountryCode.value &&this.emspPartyID.value;
        }
        this.enableDisableEMSP(this.emspIsActive);
        // Currency
        this.currency.setValue(settings.ocpi.currency);
        // TariffID
        this.tariffID.setValue(settings.ocpi.tariffID);
        const businessDetails = settings.ocpi.businessDetails;
        if (businessDetails) {
          this.name.setValue(businessDetails.name);
          this.website.setValue(businessDetails.website);
          if (businessDetails.logo) {
            const logo = businessDetails.logo;
            this.logoURL.setValue(logo.url);
            this.logoThumbnail.setValue(logo.thumbnail);
            this.logoCategory.setValue(logo.category);
            this.logoType.setValue(logo.type);
            this.logoWidth.setValue(logo.width);
            this.logoHeight.setValue(logo.height);
          }
        }
        // Init form
        this.formGroup.markAsPristine();
        // Read only
        if(!this.authorizations.canUpdate) {
          // Async call for letting the sub form groups to init
          setTimeout(() => this.formGroup.disable(), 0);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.ocpi.setting_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'general.unexpected_error_backend');
        }
      }
    });
  }

  public save(content: OcpiSetting) {
    this.ocpiSettings.ocpi = content;
    this.ocpiSettings.type = RoamingSettingsType.OCPI;
    this.spinnerService.show();
    this.componentService.saveOcpiSettings(this.ocpiSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            (!this.ocpiSettings.id ? 'settings.ocpi.create_success' : 'settings.ocpi.update_success'));
          this.refresh();
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, (!this.ocpiSettings.id ? 'settings.ocpi.create_error' : 'settings.ocpi.update_error'));
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.ocpi.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              (!this.ocpiSettings.id ? 'settings.ocpi.create_error' : 'settings.ocpi.update_error'));
        }
      }
    });
  }

  public refresh() {
    // Load Setting
    this.loadConfiguration();
  }

  public toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  public emptyStringToNull(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
  }
}
