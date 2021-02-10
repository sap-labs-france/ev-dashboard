import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { AccountActivationSetting } from '../../../types/Setting';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-accounts-activation',
  templateUrl: 'settings-accounts-activation.component.html',
})
export class AccountsActivationComponent implements OnInit {
  public isDisabled: boolean;

  public accountSettings: AccountActivationSetting;
  public router: Router;

  public formGroup!: FormGroup;
  public disableDefaultAccountActivation!: AbstractControl;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private componentService: ComponentService) {
    this.isDisabled = true;
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      disableDefaultAccountActivation : new FormControl(),
    });
    this.disableDefaultAccountActivation = this.formGroup.controls['disableDefaultAccountActivation'];
    // Register check event
    this.formGroup.controls['disableDefaultAccountActivation'].valueChanges.subscribe((value: boolean) => {
      this.accountSettings.doNotActivateByDefault = value;
    });
    this.loadSettings();
  }

  public handleAccountActivation() {
    this.isDisabled = !this.isDisabled;
  }

  public save() {
    this.spinnerService.show();
    this.componentService.saveAccountActivationSettings(this.accountSettings).subscribe(
      (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('technical_settings.account_activation.update_success');
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'technical_settings.account_activation.update_error'
          );
        }
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('technical_settings.account_activation.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'technical_settings.account_activation.update_error'
            );
        }
      }
    );
  }

  public loadSettings() {
    this.spinnerService.show();
    this.componentService.getAccountActivationSettings().subscribe((settings) => {
        this.spinnerService.hide();
        // Init values
        this.isDisabled = true;
        this.accountSettings = settings;
        this.disableDefaultAccountActivation.setValue(this.accountSettings.doNotActivateByDefault);
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('settings.smart_charging.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      });
  }

  public refresh() {
    this.loadSettings();
  }
}
