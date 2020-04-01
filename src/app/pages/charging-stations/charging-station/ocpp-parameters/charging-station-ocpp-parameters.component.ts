import { AfterViewInit, Component, ElementRef, Injectable, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { ChargingStation, ChargingStationConfiguration, OCPPConfigurationStatus, OCPPGeneralResponse, OcppParameter } from 'app/types/ChargingStation';
import { ActionResponse, DataResult } from 'app/types/DataResult';
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
import { ChargingStationOcppParametersEditableTableDataSource } from './charging-station-ocpp-parameters-editable-table-data-source.component';

@Component({
  selector: 'app-charging-station-ocpp-parameters',
  template: '<app-table [dataSource]="ocppParametersDataSource"></app-table>',
  providers: [ChargingStationOcppParametersEditableTableDataSource]
})
@Injectable()
export class ChargingStationOcppParametersComponent implements OnInit {
  @Input() charger!: ChargingStation;
  public chargerConfiguration!: OcppParameter[];
  public isAdmin: boolean;
  public formGroup!: FormGroup;
  public parameters!: FormArray;
  public userLocales: KeyValue[];

  constructor(
    public ocppParametersDataSource: ChargingStationOcppParametersEditableTableDataSource,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private localeService: LocaleService,
    private router: Router,) {
    // Check auth
    if (!authorizationService.canUpdateChargingStation()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.formGroup = new FormGroup({});
  }

  ngOnInit(): void {
    this.parameters = new FormArray([], Validators.compose([Validators.required]));
    this.ocppParametersDataSource.setFormArray(this.parameters);
    this.ocppParametersDataSource.setCharger(this.charger);
    this.loadConfiguration();
  }

  public refresh() {
    this.loadConfiguration();
  }

  public loadConfiguration() {
    if (!this.charger.id) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getChargingStationOcppParameters(this.charger.id)
    .subscribe((configurationResult: DataResult<OcppParameter>) => {
      if (configurationResult && Array.isArray(configurationResult.result)) {
        this.chargerConfiguration = configurationResult.result;
      } else {
        this.chargerConfiguration = [];
      }
      this.ocppParametersDataSource.setContent(this.chargerConfiguration);
      this.parameters.markAsPristine();
      this.spinnerService.hide();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        // Not found
        case 550:
          // Charger not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.charger_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }


/**
 * FOR FUTURE USE
 */

//   public exportOCPPParameters() {
//     this.dialogService.createAndShowYesNoDialog(
//       this.translateService.instant('chargers.dialog.exportConfig.title'),
//       this.translateService.instant('chargers.dialog.exportConfig.confirm'),
//     ).subscribe((response) => {
//       if (response === ButtonType.YES) {
//         let csv = `Charging Station${Constants.CSV_SEPARATOR}Parameter Name${Constants.CSV_SEPARATOR}Parameter Value${Constants.CSV_SEPARATOR}Site Area${Constants.CSV_SEPARATOR}Site\r\n`;
//         for (const parameter of this.chargerConfiguration) {
//           csv += `${this.charger.id}${Constants.CSV_SEPARATOR}${parameter.key}${Constants.CSV_SEPARATOR}"${Utils.replaceSpecialCharsInCSVValueParam(parameter.value)}"${Constants.CSV_SEPARATOR}${this.charger.siteArea.name}${Constants.CSV_SEPARATOR}${this.charger.siteArea.site.name}\r\n`;
//         }
//         const blob = new Blob([csv]);
//         saveAs(blob, `exported-${this.charger.id.toLowerCase()}-ocpp-parameters.csv`);
//       }
//     });
//   }


//   public updateOCPPParametersFromTemplate() {
//     if (this.charger.inactive) {
//       // Charger is not connected
//       this.dialogService.createAndShowOkDialog(
//         this.translateService.instant('chargers.action_error.command_title'),
//         this.translateService.instant('chargers.action_error.command_charger_disconnected'));
//     } else {
//       // Show yes/no dialog
//       this.dialogService.createAndShowYesNoDialog(
//         this.translateService.instant('chargers.ocpp_params_update_from_template_title'),
//         this.translateService.instant('chargers.ocpp_params_update_from_template_confirm', { chargeBoxID: this.charger.id }),
//       ).subscribe((result) => {
//         if (result === ButtonType.YES) {
//           // Show
//           this.spinnerService.show();
//           // Yes: Update
//           this.centralServerService.updateChargingStationOCPPParamWithTemplate(this.charger.id).subscribe((response) => {
//             // Hide
//             this.spinnerService.hide();
//             // Ok?
//             if (response.status === OCPPGeneralResponse.ACCEPTED) {
//               // Ok
//               this.messageService.showSuccessMessage(
//                 this.translateService.instant('chargers.ocpp_params_update_from_template_success', { chargeBoxID: this.charger.id }));
//               this.refresh();
//             } else {
//               this.refresh();
//               Utils.handleError(JSON.stringify(response), this.messageService, 'chargers.ocpp_params_update_from_template_error');
//             }
//           }, (error: any) => {
//             this.refresh();
//             // Hide
//             Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.ocpp_params_update_from_template_error');
//           });
//         }
//       });
//     }
//   }

//   public requestOCPPParameters() {
//     if (this.charger.inactive) {
//       // Charger is not connected
//       this.dialogService.createAndShowOkDialog(
//         this.translateService.instant('chargers.action_error.command_title'),
//         this.translateService.instant('chargers.action_error.command_charger_disconnected'));
//     } else {
//       // Show yes/no dialog
//       this.dialogService.createAndShowYesNoDialog(
//         this.translateService.instant('chargers.get_configuration_title'),
//         this.translateService.instant('chargers.get_configuration_confirm', { chargeBoxID: this.charger.id }),
//       ).subscribe((result) => {
//         if (result === ButtonType.YES) {
//           // Show
//           this.spinnerService.show();
//           // Yes: Update
//           this.centralServerService.requestChargingStationOCPPConfiguration(this.charger.id).subscribe((response) => {
//             // Hide
//             this.spinnerService.hide();
//             // Ok?
//             if (response.status === OCPPGeneralResponse.ACCEPTED) {
//               // Ok
//               this.messageService.showSuccessMessage(
//                 this.translateService.instant('chargers.retrieve_config_success', { chargeBoxID: this.charger.id }));
//               this.refresh();
//               } else {
//                 this.refresh();
//                 Utils.handleError(JSON.stringify(response), this.messageService, 'chargers.change_config_error');
//             }
//           }, (error) => {
//             this.refresh();
//             // Hide
//             this.spinnerService.hide();
//             // Check status
//             switch (error.status) {
//               case 401:
//                 // Not Authorized
//                 this.messageService.showErrorMessage('chargers.change_config_error');
//                 break;
//               case 550:
//                 // Does not exist
//                 this.messageService.showErrorMessage('chargers.change_config_error');
//                 break;
//               default:
//                 Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.change_config_error');
//             }
//           });
//         }
//       });
//     }
//   }
}
