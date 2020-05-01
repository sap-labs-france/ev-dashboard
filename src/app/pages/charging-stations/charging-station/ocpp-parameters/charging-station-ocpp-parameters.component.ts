import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChargingStation, OcppParameter } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { KeyValue } from 'app/types/GlobalType';
import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Utils } from '../../../../utils/Utils';
import { ChargingStationOcppParametersEditableTableDataSource } from './charging-station-ocpp-parameters-editable-table-data-source.component';

@Component({
  selector: 'app-charging-station-ocpp-parameters',
  template: '<div class="ocpp-param-component"><app-table [dataSource]="ocppParametersDataSource"></app-table></div>',
  providers: [ChargingStationOcppParametersEditableTableDataSource]
})
@Injectable()
export class ChargingStationOcppParametersComponent implements OnInit {
  @Input() public charger!: ChargingStation;
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
    private router: Router, ) {
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

  public ngOnInit(): void {
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
}
