import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { RestResponse } from 'types/GlobalType';
import { CryptoSettingsType, KeySettings } from 'types/Setting';

import { HTTPError } from '../../../types/HTTPError';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-settings-crypto',
  templateUrl: 'settings-crypto.component.html',
})
export class SettingsCryptoComponent implements OnInit {
  public formGroup!: FormGroup;
  public cryptoSettings: KeySettings;

  constructor(
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
    this.componentService.getCryptoSettings().subscribe(
      (settings) => {
        this.spinnerService.hide();
        // Keep
        this.cryptoSettings = settings;
        // Init form
        this.formGroup.markAsPristine();
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
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
      }
    );
  }

  public save(content: any) {
    if (!content.crypto) {
      return;
    }
    this.cryptoSettings.type = CryptoSettingsType.CRYPTO;
    this.cryptoSettings.crypto.formerKey = this.cryptoSettings.crypto.key;
    this.cryptoSettings.crypto.key = content.crypto.key;
    this.cryptoSettings.crypto.formerKeyProperties = this.cryptoSettings.crypto.keyProperties;
    this.cryptoSettings.crypto.keyProperties = {
      blockCypher: content.crypto.blockCypher,
      blockSize: content.crypto.blockSize,
      operationMode: content.crypto.operationMode,
    };
    // Save
    this.spinnerService.show();
    this.componentService.saveCryptoSettings(this.cryptoSettings).subscribe(
      (response) => {
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
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('technical_settings.crypto.setting_do_not_exist');
            break;
          case HTTPError.MIGRATION_IN_PROGRESS:
            this.messageService.showErrorMessage('technical_settings.crypto.migration_in_progress_error');
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
      }
    );
  }

  public refresh() {
    this.loadConfiguration();
  }
}
