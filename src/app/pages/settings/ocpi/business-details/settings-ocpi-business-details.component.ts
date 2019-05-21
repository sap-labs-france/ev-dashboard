import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Utils } from '../../../../utils/Utils';
import { Constants } from '../../../../utils/Constants';
import {ComponentEnum, ComponentService} from '../../../../services/component.service';
import { OcpiSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-ocpi-business-details',
  templateUrl: 'settings-ocpi-business-details.component.html'
})
export class SettingsOcpiBusinessDetailsComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public logoGroup: FormGroup;

  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;
  public website: AbstractControl;

  public logo_url: AbstractControl;
  public logo_thumbnail: AbstractControl;
  public logo_category: AbstractControl;
  public logo_type: AbstractControl;
  public logo_width: AbstractControl;
  public logo_height: AbstractControl;

  public ocpiSettings: OcpiSettings;

  public logoTypes: any = [
    { key: '', description: '' },
    { key: 'jpg', description: 'JPG' },
    { key: 'png', description: 'PNG' },
    { key: 'svg', description: 'SVG' },
    { key: 'gif', description: 'GIF' }
  ];

  public logoCategories: any = [
    { key: 'CHARGER', description: 'Charger' },
    { key: 'ENTRANCE', description: 'Entrance' },
    { key: 'LOCATION', description: 'Location' },
    { key: 'NETWORK', description: 'Network' },
    { key: 'OPERATOR', description: 'Operator' },
    { key: 'OWNER', description: 'Owner' },
    { key: 'OTHER', description: 'Other' }
  ]
  private numberPattern = /^[0-9]*$/;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private router: Router) {
  }

  ngOnInit(): void {
    // build form
    this.formGroup = new FormGroup({
      'country_code': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2)
        ])),
      'party_id': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3)
        ])),
      'business_details': new FormGroup({
        'name': new FormControl(''),
        'website': new FormControl('',
          Validators.pattern(Constants.URL_PATTERN)),
        'logo': new FormGroup({
          'url': new FormControl('',
            Validators.pattern(Constants.URL_PATTERN)),
          'thumbnail': new FormControl(''),
          'category': new FormControl(''),
          'type': new FormControl(''),
          'width': new FormControl(undefined,
            Validators.pattern(this.numberPattern)),
          'height': new FormControl(undefined,
            Validators.pattern(this.numberPattern))
        })
      })
    });
    // business details - CPO identifier
    this.country_code = this.formGroup.controls['country_code'];
    this.party_id = this.formGroup.controls['party_id'];
    // business details - image
    this.name = (<FormGroup>this.formGroup.controls['business_details']).controls['name'];
    this.website = (<FormGroup>this.formGroup.controls['business_details']).controls['website'];
    this.logoGroup = <FormGroup>(<FormGroup>this.formGroup.controls['business_details']).controls['logo'];
    this.logo_url = this.logoGroup.controls['url'];
    this.logo_thumbnail = this.logoGroup.controls['thumbnail'];
    this.logo_category = this.logoGroup.controls['category'];
    this.logo_type = this.logoGroup.controls['type'];
    this.logo_width = this.logoGroup.controls['width'];
    this.logo_height = this.logoGroup.controls['height'];
    // Load the conf
    this.loadConfiguration();
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getOcpiSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Init form
      this.formGroup.markAsPristine();
      // Default
      if (!settings) {
        settings = {
          'country_code': '',
          'identifier': ComponentEnum.OCPI,
          'party_id': '',
          'business_details': {
            'name': '',
            'website': '',
            'logo': {
              'url': '',
              'thumbnail': '',
              'category': '',
              'type': '',
              'width': undefined,
              'height': undefined
            },
          }
        };
      }
      // Keep
      this.ocpiSettings = settings;
      // business details - CPO identifier
      this.country_code.setValue(settings.country_code);
      this.party_id.setValue(settings.party_id);
      const businessDetails = settings.business_details;
      this.name.setValue(businessDetails.name);
      this.website.setValue(businessDetails.website);
      if (businessDetails.logo) {
        const logo = businessDetails.logo;
        this.logo_url.setValue(logo.url);
        this.logo_thumbnail.setValue(logo.thumbnail);
        this.logo_category.setValue(logo.category);
        this.logo_type.setValue(logo.type);
        this.logo_width.setValue(logo.width);
        this.logo_height.setValue(logo.height);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.ocpi.setting_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    console.log('content');
    console.log(content);
    // Set the content
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        this.ocpiSettings[key] = content[key];
      }
    }
    console.log('ocpiSettings');
    console.log(this.ocpiSettings);
    // Save
    this.spinnerService.show();
    this.componentService.saveOcpiSettings(this.ocpiSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.ocpiSettings.id ? 'settings.ocpi.create_success' : 'settings.ocpi.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.ocpiSettings.id ? 'settings.ocpi.create_error' : 'settings.ocpi.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.ocpi.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.ocpiSettings.id ? 'settings.ocpi.create_error' : 'settings.ocpi.update_error'));
      }
    });
  }

  public refresh() {
    // Load Setting
    this.loadConfiguration();
  }
}
