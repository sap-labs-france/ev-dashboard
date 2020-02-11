import { AfterViewInit, Component, ElementRef, Injectable, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { ChargingStation, ChargingStationConfiguration, OCPPConfigurationStatus, OCPPGeneralResponse } from 'app/types/ChargingStation';
import { ActionResponse } from 'app/types/DataResult';
import { KeyValue } from 'app/types/GlobalType';
import { ButtonType } from 'app/types/Table';
// @ts-ignore
import saveAs from 'file-saver';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';
import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ConfigService } from '../../../../services/config.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-ocpp-parameters',
  templateUrl: './charging-station-ocpp-parameters.component.html',
})
@Injectable()
export class ChargingStationOcppParametersComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() charger!: ChargingStation;
  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;
  public searchPlaceholder = '';
  public chargerConfiguration!: KeyValue[];
  public loadedChargerConfiguration: any;
  public userLocales: KeyValue[];
  public isAdmin: boolean;
  public formGroup: FormGroup;
  isGetConfigurationActive = true;
  @ViewChildren('parameter') parameterInput!: QueryList<ElementRef>;
  private messages: any;
  private searchValue = '';
  private alive!: boolean;

  constructor(
    private configService: ConfigService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService) {

    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');

    // Check auth
    if (!authorizationService.canUpdateChargingStation()) {
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

  ngAfterViewInit(): void {
    this.alive = true;
    // Init initial value
    this.searchInput.nativeElement.value = this.getSearchValue();
    // Observe the Search field
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      takeWhile(() => this.alive),
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged(),
    ).subscribe((text: string) => {
      this.setSearchValue(text);
      this.refresh();
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  public refresh() {
    this.loadConfiguration();
  }

  public getSearchValue(): string {
    return this.searchValue;
  }

  public setSearchValue(value: string) {
    this.searchValue = value;
  }

  public loadConfiguration() {
    if (!this.charger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargingStationConfiguration(this.charger.id).subscribe((configurationResult: ChargingStationConfiguration) => {
      if (configurationResult && Array.isArray(configurationResult.configuration)) {
        this.chargerConfiguration = configurationResult.configuration;
      } else {
        this.chargerConfiguration = [];
      }
      this.loadedChargerConfiguration = JSON.parse(JSON.stringify(this.chargerConfiguration)); // keep a copy of teh original loaded data
      // Search filter
      const filteredChargerConfiguration = [];
      for (const parameter of this.chargerConfiguration) {
        let key = parameter.key;
        key = key.toLowerCase();
        if (key.includes(this.searchValue.toLowerCase())) {
          filteredChargerConfiguration.push(parameter);
        }
      }
      this.chargerConfiguration = filteredChargerConfiguration;
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public saveConfiguration(item: any) {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.set_configuration_title'),
      this.translateService.instant('chargers.set_configuration_confirm', { chargeBoxID: this.charger.id, key: item.key }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Show
        this.spinnerService.show();
        // Yes: Update
        this.centralServerService.updateChargingStationOCPPConfiguration(
          this.charger.id, { key: item.key, value: this.formGroup.controls[item.key].value }).subscribe((response) => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === OCPPConfigurationStatus.ACCEPTED ||
                response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
              // Ok
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.change_params_success', { chargeBoxID: this.charger.id }));
              // Reboot Required
              if (response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
                // Show yes/no dialog
                this.dialogService.createAndShowYesNoDialog(
                    this.translateService.instant('chargers.reboot_required_title'),
                    this.translateService.instant('chargers.reboot_required_confirm', { chargeBoxID: this.charger.id }),
                  ).subscribe((result2) => {
                    if (result2 === ButtonType.YES) {
                      // Reboot
                      this.rebootChargingStation();
                    }
                });
              }
            } else {
              this.refresh();
              Utils.handleError(JSON.stringify(response),
              this.messageService, this.messages['change_params_error']);
            }
            this.refresh();
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

  public rebootChargingStation() {
    this.spinnerService.show();
    // Reboot
    this.centralServerService.rebootChargingStation(this.charger.id).subscribe((response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === OCPPGeneralResponse.ACCEPTED) {
          // Ok
          this.messageService.showSuccessMessage(
            this.translateService.instant('chargers.reboot_success', {chargeBoxID: this.charger.id}));
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'chargers.reset_error');
        }
      }, (error: any) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService,
          this.centralServerService, 'chargers.reset_error');
      });
  }

  public exportConfiguration() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.dialog.exportConfig.title'),
      this.translateService.instant('chargers.dialog.exportConfig.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        let csv = `Charging Station${Constants.CSV_SEPARATOR}Parameter Name${Constants.CSV_SEPARATOR}Parameter Value${Constants.CSV_SEPARATOR}Site Area${Constants.CSV_SEPARATOR}Site\r\n`;
        for (const parameter of this.chargerConfiguration) {
          csv += `${this.charger.id}${Constants.CSV_SEPARATOR}${parameter.key}${Constants.CSV_SEPARATOR}"${Utils.replaceSpecialCharsInCSVValueParam(parameter.value)}"${Constants.CSV_SEPARATOR}${this.charger.siteArea.name}${Constants.CSV_SEPARATOR}${this.charger.siteArea.site.name}\r\n`;
        }
        const blob = new Blob([csv]);
        saveAs(blob, `exported-${this.charger.id.toLowerCase()}-ocpp-parameters.csv`);
      }
    });
  }

  public changeOCPPParameter(item: any) {
    if (item.icon === 'edit') {
      if (this.charger.inactive) {
        // Charger is not connected
        this.dialogService.createAndShowOkDialog(
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

  public clearOCPPParameter(item: any) {
    // activate get configuration button
    this.isGetConfigurationActive = true;
    // Cancel input changes
    item.icon = 'edit';
    this.formGroup.controls[item.key].reset();
    this.formGroup.controls[item.key].setValue(this.loadedChargerConfiguration.find((element: any) => {
      return element.key === item.key;
    }).value);
    this.formGroup.controls[item.key].disable();
    this.formGroup.markAsPristine();
  }

  public updateOCPPParamsFromTemplate() {
    if (this.charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.ocpp_params_update_from_template_title'),
        this.translateService.instant('chargers.ocpp_params_update_from_template_confirm', { chargeBoxID: this.charger.id }),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          // Show
          this.spinnerService.show();
          // Yes: Update
          this.centralServerService.updateChargingStationOCPPParamWithTemplate(this.charger.id).subscribe((response) => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === OCPPGeneralResponse.ACCEPTED) {
              // Ok
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.retrieve_config_success', { chargeBoxID: this.charger.id }));
              this.refresh();
            } else {
              this.refresh();
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.messages['change_config_error']);
            }
          }, (error: any) => {
            this.refresh();
            // Hide
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.messages['change_config_error']);
          });
        }
      });
    }
  }

  public requestOCPPConfiguration() {
    if (this.charger.inactive) {
      // Charger is not connected
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.command_title'),
        this.translateService.instant('chargers.action_error.command_charger_disconnected'));
    } else {
      // Show yes/no dialog
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.get_configuration_title'),
        this.translateService.instant('chargers.get_configuration_confirm', { chargeBoxID: this.charger.id }),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          // Show
          this.spinnerService.show();
          // Yes: Update
          this.centralServerService.requestChargingStationOCPPConfiguration(this.charger.id).subscribe((response) => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === OCPPGeneralResponse.ACCEPTED) {
              // Ok
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.retrieve_config_success', { chargeBoxID: this.charger.id }));
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
