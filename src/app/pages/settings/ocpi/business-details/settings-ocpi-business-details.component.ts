import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthorizationService } from '../../../../services/authorization-service';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Utils } from '../../../../utils/Utils';
import { Constants } from '../../../../utils/Constants';

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

  public currentCPODetails: any;
  public currentSettingID: any;

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
  private urlPattern = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router
  ) {
    // define default value
    this.currentCPODetails = {
      'country_code': '',
      'party_id': '',
      'business_details': {
        'name': '',
        'logo': {
          "url": "",
          "thumbnail": "",
          "category": "",
          "type": "",
          "width": undefined,
          "height": undefined
        },
        "website": ""
      }
    };


  }

  ngOnInit(): void {
    // build form
    this.formGroup = new FormGroup({
      'country_code': new FormControl(this.currentCPODetails.country_code,
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2)
        ])),
      'party_id': new FormControl(this.currentCPODetails.party_id,
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3)
        ])),
      'business_details': new FormGroup({
        'name': new FormControl(this.currentCPODetails.business_details.name),
        'website': new FormControl(this.currentCPODetails.business_details.website,
          Validators.pattern(this.urlPattern)),
        'logo': new FormGroup({
          'url': new FormControl(this.currentCPODetails.business_details.logo.url,
            Validators.pattern(this.urlPattern)),
          'thumbnail': new FormControl(this.currentCPODetails.business_details.logo.thumbnail),
          'category': new FormControl(this.currentCPODetails.business_details.logo.category),
          'type': new FormControl(this.currentCPODetails.business_details.logo.type),
          'width': new FormControl(this.currentCPODetails.business_details.logo.width,
            Validators.pattern(this.numberPattern)),
          'height': new FormControl(this.currentCPODetails.business_details.logo.height,
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

    // load ocpi configuration
    this.loadOCPIConfiguration();
  }

  public loadOCPIConfiguration() {
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getSettings(Constants.SETTINGS_OCPI).subscribe((ocpiConfiguration) => {
      this.spinnerService.hide();

      // initialize empty
      let ocpiContent = {
        'country_code': '',
        'party_id': '',
        'business_details': {
          'name': '',
          'logo': {
            "url": "",
            "thumbnail": "",
            "category": "",
            "type": "",
            "width": undefined,
            "height": undefined
          },
          "website": ""
        }
      };

      // takes the first one
      if (ocpiConfiguration && ocpiConfiguration.count > 0 && ocpiConfiguration.result[0].content) {
        // build default void object
        ocpiContent = ocpiConfiguration.result[0].content;

        // define setting ID
        this.currentSettingID = ocpiConfiguration.result[0].id;

        // business details - CPO identifier
        if (ocpiContent.country_code) { this.country_code.setValue(ocpiContent.country_code); }
        if (ocpiContent.party_id) { this.party_id.setValue(ocpiContent.party_id); }

        if (ocpiContent.business_details) {
          const businessDetails = ocpiContent.business_details;
          if (businessDetails.name) { this.name.setValue(businessDetails.name); }
          if (businessDetails.website) { this.website.setValue(businessDetails.website); }

          if (businessDetails.logo) {
            const logo = businessDetails.logo;

            if (logo.url) { this.logo_url.setValue(logo.url); }
            if (logo.thumbnail) { this.logo_thumbnail.setValue(logo.thumbnail); }
            if (logo.category) { this.logo_category.setValue(logo.category); }
            if (logo.type) { this.logo_type.setValue(logo.type); }
            if (logo.width) { this.logo_width.setValue(logo.width); }
            if (logo.height) { this.logo_height.setValue(logo.height); }
          }
        }
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
    if (this.currentSettingID) {
      this._updateOCPIConfiguration(content);
    } else {
      this._createOCPIConfiguration(content);
    }
  }

  private _createOCPIConfiguration(content) {
    // build setting payload
    let setting = {
      "id": null,
      "identifier": Constants.SETTINGS_OCPI,
      "content": content
    };

    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.createSetting(setting).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('settings.ocpi.create_success');
        // Refresh
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.ocpi.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Setting deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('settings.ocpi.setting_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.ocpi.create_error');
      }
    });
  }

  private _updateOCPIConfiguration(content) {
    // build setting payload
    let setting = {
      "id": this.currentSettingID,
      "identifier": Constants.SETTINGS_OCPI,
      "content": content
    };
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateSetting(setting).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('settings.ocpi.update_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.ocpi.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Setting deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('settings.ocpi.setting_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.ocpi.update_error');
      }
    });
  }

  public refresh() {
    // Load Setting
    this.loadOCPIConfiguration();
  }

}
