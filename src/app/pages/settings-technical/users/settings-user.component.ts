import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { UserSettings } from '../../../types/Setting';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-user',
  templateUrl: 'settings-user.component.html',
})
export class SettingsUserComponent implements OnInit {
  public isDisabled: boolean;

  public userSettings: UserSettings;
  public router: Router;

  public formGroup!: FormGroup;
  public autoActivateAccountAfterValidation!: AbstractControl;

  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private componentService: ComponentService) {
    this.isDisabled = true;
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      autoActivateAccountAfterValidation : new FormControl(),
    });
    this.autoActivateAccountAfterValidation = this.formGroup.controls['autoActivateAccountAfterValidation'];
    // Register check event
    this.formGroup.controls['autoActivateAccountAfterValidation'].valueChanges.subscribe((value: boolean) => {
      this.userSettings.user.autoActivateAccountAfterValidation = value;
    });
    this.loadSettings();
  }

  public handleAccountActivation() {
    this.isDisabled = !this.isDisabled;
  }

  public save() {
    this.spinnerService.show();
    this.componentService.saveUserSettings(this.userSettings).subscribe(
      (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('technical_settings.user.update_success');
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response), this.messageService, 'technical_settings.user.update_error'
          );
        }
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('technical_settings.user.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'technical_settings.user.update_error'
            );
        }
      }
    );
  }

  // Load with data from db
  public loadSettings() {
    this.spinnerService.show();
    this.componentService.getUserSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Init values
      this.isDisabled = true;
      this.userSettings = settings;
      this.autoActivateAccountAfterValidation.setValue(this.userSettings.user.autoActivateAccountAfterValidation);
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('technical_settings.user.setting_do_not_exist');
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
