import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { CarConnectorSettings } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { SettingsCarConnectorConnectionEditableTableDataSource } from './settings-car-connector-connections-list-table-data-source';

@Component({
  selector: 'app-settings-car-connector',
  templateUrl: 'settings-car-connector.component.html',
  styleUrls: ['settings-car-connector.component.scss'],
  providers: [SettingsCarConnectorConnectionEditableTableDataSource],
})
export class SettingsCarConnectorComponent implements OnInit {
  public isActive = false;
  public authorizations: SettingAuthorizationActions;
  public formGroup!: FormGroup;
  public carConnectors!: FormArray;

  public carConnectorSettings!: CarConnectorSettings;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    public settingsCarConnectorConnectionTableDataSource: SettingsCarConnectorConnectionEditableTableDataSource
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.CAR_CONNECTOR);
  }

  public ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new FormGroup({
        carConnectors: new FormArray([]),
      });
      // Form Controls
      this.carConnectors = this.formGroup.controls['carConnectors'] as FormArray;
      // Assign connections form to data source
      this.settingsCarConnectorConnectionTableDataSource.setFormArray(this.carConnectors);
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getCarConnectorSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init Auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        // Keep
        this.carConnectorSettings = settings;
        // Set Auth
        this.settingsCarConnectorConnectionTableDataSource.setAuthorizations(this.authorizations);
        // Set
        this.settingsCarConnectorConnectionTableDataSource.setContent(
          this.carConnectorSettings.carConnector.connections
        );
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.car_connector.setting_not_found');
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

  public save() {
    // Assign connections
    this.carConnectorSettings.carConnector.connections =
      this.settingsCarConnectorConnectionTableDataSource.getContent();
    // Save
    this.spinnerService.show();
    this.componentService.saveCarConnectorConnectionSettings(this.carConnectorSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            !this.carConnectorSettings.id
              ? 'settings.car_connector.create_success'
              : 'settings.car_connector.update_success'
          );
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            !this.carConnectorSettings.id
              ? 'settings.car_connector.create_error'
              : 'settings.car_connector.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.car_connector.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              !this.carConnectorSettings.id
                ? 'settings.car_connector.create_error'
                : 'settings.car_connector.update_error'
            );
        }
      },
    });
  }

  public refresh() {
    // Reload settings
    this.loadConfiguration();
  }
}
