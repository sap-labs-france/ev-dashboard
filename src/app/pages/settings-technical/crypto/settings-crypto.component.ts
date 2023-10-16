import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { SettingAuthorizationActions } from 'types/Authorization';
import { RestResponse } from 'types/GlobalType';
import { CryptoSettings, CryptoSettingsType } from 'types/Setting';

import { HTTPError } from '../../../types/HTTPError';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-crypto',
  templateUrl: 'settings-crypto.component.html',
})
export class SettingsCryptoComponent implements OnInit {
  public formGroup!: FormGroup;
  public cryptoSettings: CryptoSettings;
  public authorizations: SettingAuthorizationActions;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    // Build the form
    this.formGroup = new FormGroup({});
    // Load the conf
    this.loadConfiguration();
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getCryptoSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        // Keep
        this.cryptoSettings = settings;
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('technical_settings.crypto.setting_do_not_exist');
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

  public save(content: any) {
    if (!content.crypto) {
      return;
    }
    this.cryptoSettings.type = CryptoSettingsType.CRYPTO;
    this.cryptoSettings.crypto.key = content.crypto.key;
    this.cryptoSettings.crypto.keyProperties = {
      blockCypher: content.crypto.blockCypher,
      blockSize: content.crypto.blockSize,
      operationMode: content.crypto.operationMode,
    };
    // Save
    this.spinnerService.show();
    this.componentService.saveCryptoSettings(this.cryptoSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('technical_settings.crypto.update_success');
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'technical_settings.crypto.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('technical_settings.crypto.setting_do_not_exist');
            break;
          case HTTPError.CRYPTO_MIGRATION_IN_PROGRESS:
            this.messageService.showErrorMessage(
              'technical_settings.crypto.crypto_migration_in_progress_error'
            );
            break;
          case HTTPError.CRYPTO_ALGORITHM_NOT_SUPPORTED:
            this.messageService.showErrorMessage(
              'technical_settings.crypto.crypto_algorithm_error'
            );
            break;
          case HTTPError.CRYPTO_KEY_LENGTH_INVALID:
            this.messageService.showErrorMessage(
              'technical_settings.crypto.crypto_key_length_error'
            );
            break;
          case HTTPError.CRYPTO_CHECK_FAILED:
            this.messageService.showErrorMessage('technical_settings.crypto.crypto_check_error');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'technical_settings.crypto.update_error'
            );
        }
      },
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
