import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { OicpSetting, RoamingSettings, RoamingSettingsType } from '../../../types/Setting';
import TenantComponents from '../../../types/TenantComponents';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-oicp',
  templateUrl: 'settings-oicp.component.html',
})
export class SettingsOicpComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public logoGroup!: FormGroup;

  public cpoCountryCode!: AbstractControl;
  public cpoPartyID!: AbstractControl;
  public cpoKey!: AbstractControl;
  public cpoCert!: AbstractControl;
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

  public oicpSettings!: RoamingSettings;

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
    this.isActive = this.componentService.isActive(TenantComponents.OICP);
  }

  public ngOnInit() {
    if (this.isActive) {
      // build form
      this.formGroup = new FormGroup({
        businessDetails: new FormGroup({
          name: new FormControl(''),
          website: new FormControl('',
            Validators.pattern(Constants.URL_PATTERN)),
          logo: new FormGroup({
            url: new FormControl('',
              Validators.pattern(Constants.URL_PATTERN)),
            thumbnail: new FormControl(''),
            category: new FormControl(''),
            type: new FormControl(''),
            width: new FormControl(undefined,
              Validators.pattern(/^[0-9]*$/)),
            height: new FormControl(undefined,
              Validators.pattern(/^[0-9]*$/)),
          }),
        }),
        cpo: new FormGroup({
          countryCode: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(2),
              Validators.minLength(2),
            ])),
          partyID: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(3),
              Validators.minLength(3),
            ])),
          key: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.minLength(2),
            ])),
          cert: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.minLength(3),
            ])),
        }),
        emsp: new FormGroup({
          countryCode: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(2),
              Validators.minLength(2),
            ])),
          partyID: new FormControl('',
            Validators.compose([
              Validators.required,
              Validators.maxLength(3),
              Validators.minLength(3),
            ])),
        }),
        currency: new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(3),
          ]),
        ),
      });
      // CPO identifier
      this.cpoCountryCode = (this.formGroup.controls['cpo'] as FormGroup).controls['countryCode'];
      this.cpoPartyID = (this.formGroup.controls['cpo'] as FormGroup).controls['partyID'];
      // CPO Certificates
      this.cpoKey = (this.formGroup.controls['cpo'] as FormGroup).controls['key'];
      this.cpoCert = (this.formGroup.controls['cpo'] as FormGroup).controls['cert'];
      // EMSP identifier
      this.emspCountryCode = (this.formGroup.controls['emsp'] as FormGroup).controls['countryCode'];
      this.emspPartyID = (this.formGroup.controls['emsp'] as FormGroup).controls['partyID'];
      // business details - image
      this.name = (this.formGroup.controls['businessDetails'] as FormGroup).controls['name'];
      this.website = (this.formGroup.controls['businessDetails'] as FormGroup).controls['website'];
      this.logoGroup = ((this.formGroup.controls['businessDetails'] as FormGroup).controls['logo'] as FormGroup);
      this.logoURL = this.logoGroup.controls['url'];
      this.logoThumbnail = this.logoGroup.controls['thumbnail'];
      this.logoCategory = this.logoGroup.controls['category'];
      this.logoType = this.logoGroup.controls['type'];
      this.logoWidth = this.logoGroup.controls['width'];
      this.logoHeight = this.logoGroup.controls['height'];
      this.currency = this.formGroup.controls['currency'];
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getOicpSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.oicpSettings = settings;
      // CPO identifier
      if (settings.oicp.cpo) {
        this.cpoCountryCode.setValue(settings.oicp.cpo.countryCode);
        this.cpoPartyID.setValue(settings.oicp.cpo.partyID);
        this.cpoKey.setValue(settings.oicp.cpo.key);
        this.cpoCert.setValue(settings.oicp.cpo.cert);
      }
      // EMSP identifier
      if (settings.oicp.cpo) {
        this.emspCountryCode.setValue(settings.oicp.emsp.countryCode);
        this.emspPartyID.setValue(settings.oicp.emsp.partyID);
      }
      // Currency
      this.currency.setValue(settings.oicp.currency);
      const businessDetails = settings.oicp.businessDetails;
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
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.oicp.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public save(content: OicpSetting) {
    this.oicpSettings.oicp = content;
    this.oicpSettings.type = RoamingSettingsType.OICP;
    this.spinnerService.show();
    this.componentService.saveOicpSettings(this.oicpSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.oicpSettings.id ? 'settings.oicp.create_success' : 'settings.oicp.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.oicpSettings.id ? 'settings.oicp.create_error' : 'settings.oicp.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.oicp.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.oicpSettings.id ? 'settings.oicp.create_error' : 'settings.oicp.update_error'));
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
}
