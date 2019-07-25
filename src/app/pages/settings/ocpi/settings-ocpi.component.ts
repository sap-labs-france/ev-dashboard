import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OcpiSettings, OcpiSettingsType } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { ComponentEnum, ComponentService } from '../../../services/component.service';

@Component({
  selector: 'app-settings-ocpi',
  templateUrl: 'settings-ocpi.component.html'
})
export class SettingsOcpiComponent implements OnInit {
  public isActive = false;

  public formGroup: FormGroup;
  public logoGroup: FormGroup;

  public countryCode: AbstractControl;
  public partyID: AbstractControl;
  public website: AbstractControl;

  public name: AbstractControl;
  public logoURL: AbstractControl;
  public logoThumbnail: AbstractControl;
  public logoCategory: AbstractControl;
  public logoType: AbstractControl;
  public logoWidth: AbstractControl;
  public logoHeight: AbstractControl;

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
  ];

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private router: Router) {
    this.isActive = this.componentService.isActive(ComponentEnum.OCPI);
  }

  ngOnInit() {
    if (this.isActive) {
      // build form
      this.formGroup = new FormGroup({
        'countryCode': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(2),
            Validators.minLength(2)
          ])),
        'partyID': new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(3),
            Validators.minLength(3)
          ])),
        'businessDetails': new FormGroup({
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
              Validators.pattern(/^[0-9]*$/)),
            'height': new FormControl(undefined,
              Validators.pattern(/^[0-9]*$/))
          })
        })
      });
      // business details - CPO identifier
      this.countryCode = this.formGroup.controls['countryCode'];
      this.partyID = this.formGroup.controls['partyID'];
      // business details - image
      this.name = (<FormGroup>this.formGroup.controls['businessDetails']).controls['name'];
      this.website = (<FormGroup>this.formGroup.controls['businessDetails']).controls['website'];
      this.logoGroup = <FormGroup>(<FormGroup>this.formGroup.controls['businessDetails']).controls['logo'];
      this.logoURL = this.logoGroup.controls['url'];
      this.logoThumbnail = this.logoGroup.controls['thumbnail'];
      this.logoCategory = this.logoGroup.controls['category'];
      this.logoType = this.logoGroup.controls['type'];
      this.logoWidth = this.logoGroup.controls['width'];
      this.logoHeight = this.logoGroup.controls['height'];
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getOcpiSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.ocpiSettings = settings;
      // business details - CPO identifier
      this.countryCode.setValue(settings.ocpi.countryCode);
      this.partyID.setValue(settings.ocpi.partyID);
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
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.ocpi.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    this.ocpiSettings.ocpi = content;
    this.ocpiSettings.type = OcpiSettingsType.gireve;
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

  toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }
}
