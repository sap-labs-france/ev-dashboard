import { Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Charger } from '../../../../common.types';
import { LocaleService } from '../../../../services/locale.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../../services/central-server.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AuthorizationService } from '../../../../services/authorization-service';
import { MessageService } from '../../../../services/message.service';
import { Utils } from '../../../../utils/Utils';
import { Constants } from '../../../../utils/Constants';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-charger-ocpp-configuration',
  styleUrls: ['../../charging-stations-data-source-table.scss', '../../../../shared/table/table.component.scss'],
  templateUrl: './charging-station-ocpp-parameters.html'
})
@Injectable()
export class ChargingStationOCPPConfigurationComponent implements OnInit {
  @Input() charger: Charger;
  public chargerConfiguration;
  public loadedChargerConfiguration;
  private messages;
  public userLocales;
  public isAdmin;
  public formGroup: FormGroup;
  isGetConfigurationActive = true;
  @ViewChildren('parameter') parameterInput: QueryList<ElementRef>;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({ 'id': 'currentCharger.id' })) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.formGroup = new FormGroup({});
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  /**
   * refresh
   */
  public refresh() {
    this.loadConfiguration()
  }

  /**
   * loadConfiguration : Retrieve charging station configuration from rest server
   */
  public loadConfiguration() {
    if (!this.charger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargingStationConfiguration(this.charger.id).subscribe((configurationResult) => {
      if (configurationResult && Array.isArray(configurationResult.configuration)) {
        this.chargerConfiguration = configurationResult.configuration;
      } else {
        this.chargerConfiguration = [];
      }
      this.loadedChargerConfiguration = JSON.parse(JSON.stringify(this.chargerConfiguration)); // keep a copy of teh original loaded data
      for (const parameter of this.chargerConfiguration) {
        if (!parameter.readonly) {
          this.formGroup.addControl(parameter.key, new FormControl());
          this.formGroup.controls[parameter.key].disable();
          parameter['icon'] = 'edit';
          parameter['tooltip'] = 'general.save';
        }
      }
      this.formGroup.markAsPristine();
      this.spinnerService.hide();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Charger not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['charger_not_found']);
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.translateService.instant('general.unexpected_error_backend'));
      }
    });
  }

  /**
   * saveConfiguration
   */
  public saveConfiguration(item) {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.set_configuration_title'),
      this.translateService.instant('chargers.set_configuration_confirm', { 'chargeBoxID': this.charger.id, key: item.key })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        // Show
        this.spinnerService.show();
        // Yes: Update
        this.centralServerService.updateChargingStationOCPPConfiguration(
          this.charger.id, { key: item.key, value: this.formGroup.controls[item.key].value }).subscribe(response => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // Ok
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.change_params_success', { chargeBoxID: this.charger.id }));
              this.refresh();
            } else {
              this.refresh();
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.messages['change_params_error']);
            }
          }, (error) => {
            this.refresh();
            // Hide
            this.spinnerService.hide();
            // Check status
            switch (error.status) {
              case 401:
                // Not Authorized
                this.messageService.showErrorMessage(this.translateService.instant('chargers.change_params_error'));
                break;
              case 550:
                // Does not exist
                this.messageService.showErrorMessage(this.messages['change_params_error']);
                break;
              default:
                Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                  this.messages['change_params_error']);
            }
          });
      }
    });
  }


  /**
   * changeParameter: change an OCPP parameter value
   */
  public changeParameter(item) {
    if (item.icon === 'edit') {
      if (this.charger.inactive) {
        // Charger is not connected
        this.dialogService.createAndShowOkDialog(this.dialog,
          this.translateService.instant('chargers.action_error.command_title'),
          this.translateService.instant('chargers.action_error.command_charger_disconnected'));
      } else {
        // deactivate get configuration button
        this.isGetConfigurationActive = false;
        // Change input to enable and give him focus
        item.icon = 'save';
        item.tooltip = 'general.save';
        this.formGroup.controls[item.key].enable();
        this.parameterInput.find((element: ElementRef) => {
          return element.nativeElement.id === item.key;
        }).nativeElement.focus();
        this.formGroup.markAsDirty();
      }
    } else {
      // activate get configuration button
      this.isGetConfigurationActive = true;
      // Save changes changes
      this.saveConfiguration(item);
      this.formGroup.controls[item.key].disable();
      item.icon = 'edit';
      item.tooltip = 'general.edit';
      this.formGroup.markAsPristine();
    }
  }

  /**
   * clearParameter
   */
  public clearParameter(item) {
    // activate get configuration button
    this.isGetConfigurationActive = true;
    // Cancel input changes
    item.icon = 'edit';
    this.formGroup.controls[item.key].reset();
    this.formGroup.controls[item.key].setValue(this.loadedChargerConfiguration.find((element) => {
      return element.key === item.key;
    }).value);
    this.formGroup.controls[item.key].disable();
    this.formGroup.markAsPristine();
  }

  /**
   * getConfiguration:Retrieve : Retrieve OCPP Configuration
   */
  public getConfiguration() {
    if (this.charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(this.dialog,
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        this.dialog,
        this.translateService.instant('chargers.get_configuration_title'),
        this.translateService.instant('chargers.get_configuration_confirm', { 'chargeBoxID': this.charger.id })
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          // Show
          this.spinnerService.show();
          // Yes: Update
          this.centralServerService.getChargingStationOCPPConfiguration(this.charger.id).subscribe(response => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // Ok
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.change_config_success', { chargeBoxID: this.charger.id }));
              this.refresh();
            } else {
              this.refresh();
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.messages['change_config_error']);
            }
          }, (error) => {
            this.refresh();
            // Hide
            this.spinnerService.hide();
            // Check status
            switch (error.status) {
              case 401:
                // Not Authorized
                this.messageService.showErrorMessage(this.messages['change_config_error']);
                break;
              case 550:
                // Does not exist
                this.messageService.showErrorMessage(this.messages['change_config_error']);
                break;
              default:
                Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                  this.messages['change_config_error']);
            }
          });
        }
      });
    }
  }
}


