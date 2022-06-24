import { Component, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { MobileSettings, MobileSettingsType, UserSettings } from '../../../types/Setting';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-mobile',
  templateUrl: 'settings-mobile.component.html',
})
export class SettingsMobileComponent implements OnInit {

  public androidMobileAppID!: AbstractControl;
  public scheme!: AbstractControl;

  public mobileSettings: MobileSettings;
  public router: Router;
  public formGroup!: FormGroup;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private componentService: ComponentService
  ) { }

  public ngOnInit() {
    this.formGroup = new FormGroup({});
    // Init the form
    this.formGroup.addControl('androidMobileAppID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('scheme', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    // Form
    this.androidMobileAppID = this.formGroup.controls['androidMobileAppID'];
    this.scheme = this.formGroup.controls['scheme'];
    this.loadMobileAppSettings();
  }

  public save() {
    if (!this.androidMobileAppID.value || !this.scheme.value) {
      return;
    }
    this.spinnerService.show();
    this.mobileSettings.type = MobileSettingsType.MOBILE;
    this.mobileSettings.mobile.androidMobileAppID = this.androidMobileAppID.value;
    this.mobileSettings.mobile.scheme = this.scheme.value;
    this.componentService.saveMobileAppSettings(this.mobileSettings).subscribe(
      (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('technical_settings.mobile.update_success');
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response), this.messageService, 'technical_settings.mobile.update_error'
          );
        }
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('technical_settings.mobile.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'technical_settings.user.update_error'
            );
        }
      }
    );
  }

  public loadMobileAppSettings() {
    this.spinnerService.show();
    this.componentService.getMobileAppSettings().subscribe(
      (settings) => {
        this.spinnerService.hide();
        if (settings?.mobile) {
          // load
          this.mobileSettings = settings;
          this.androidMobileAppID.setValue(settings.mobile.androidMobileAppID);
          this.scheme.setValue(settings.mobile.scheme);
          // Init form
          this.formGroup.markAsPristine();
        }
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('technical_settings.mobile.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      }
    );
  }

  public refresh() {
    this.loadMobileAppSettings();
  }
}
