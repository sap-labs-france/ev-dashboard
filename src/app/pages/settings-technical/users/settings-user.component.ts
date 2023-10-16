import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
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
  public authorizations: SettingAuthorizationActions;

  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private componentService: ComponentService
  ) {
    this.isDisabled = true;
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      autoActivateAccountAfterValidation: new FormControl<boolean>(false),
    });
    this.autoActivateAccountAfterValidation =
      this.formGroup.controls['autoActivateAccountAfterValidation'];
    // Register check event
    this.formGroup.controls['autoActivateAccountAfterValidation'].valueChanges.subscribe(
      (value: boolean) => {
        this.userSettings.user.autoActivateAccountAfterValidation = value;
      }
    );
    this.loadSettings();
  }

  public handleAccountActivation() {
    this.isDisabled = !this.isDisabled;
  }

  public save() {
    this.spinnerService.show();
    this.componentService.saveUserSettings(this.userSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('technical_settings.user.update_success');
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'technical_settings.user.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('technical_settings.user.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'technical_settings.user.update_error'
            );
        }
      },
    });
  }

  // Load with data from db
  public loadSettings() {
    this.spinnerService.show();
    this.componentService.getUserSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        // Init values
        this.isDisabled = true;
        this.userSettings = settings;
        this.autoActivateAccountAfterValidation.setValue(
          this.userSettings.user.autoActivateAccountAfterValidation
        );
        // Read only
        if (!this.authorizations.canUpdate) {
          // Async call for letting the sub form groups to init
          setTimeout(() => this.formGroup.disable(), 0);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('technical_settings.user.setting_do_not_exist');
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
      },
    });
  }

  public refresh() {
    this.loadSettings();
  }
}
