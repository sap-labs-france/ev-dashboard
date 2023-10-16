import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStation, OcppParameter } from '../../../../types/ChargingStation';
import { DataResult } from '../../../../types/DataResult';
import { KeyValue } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';
import { ChargingStationOcppParametersEditableTableDataSource } from './charging-station-ocpp-parameters-editable-table-data-source.component';

@Component({
  selector: 'app-charging-station-ocpp-parameters',
  template:
    '<div class="h-100"><app-table [dataSource]="ocppParametersDataSource"></app-table></div>',
  providers: [ChargingStationOcppParametersEditableTableDataSource],
})
// @Injectable()
export class ChargingStationOcppParametersComponent implements OnInit {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargingStationsAuthorizations: ChargingStationsAuthorizations;

  public formGroup!: UntypedFormGroup;
  public parameters!: UntypedFormArray;
  public userLocales: KeyValue[];

  public constructor(
    public ocppParametersDataSource: ChargingStationOcppParametersEditableTableDataSource,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private localeService: LocaleService,
    private router: Router
  ) {
    this.userLocales = this.localeService.getLocales();
    this.formGroup = new UntypedFormGroup({});
  }

  public ngOnInit(): void {
    this.parameters = new UntypedFormArray([], Validators.compose([Validators.required]));
    this.ocppParametersDataSource.setFormArray(this.parameters);
    this.ocppParametersDataSource.setCharger(this.chargingStation);
    this.loadOcppParameters();
    this.ocppParametersDataSource.getRefreshEvent().subscribe(() => {
      this.loadOcppParameters();
    });
  }

  public loadOcppParameters() {
    if (this.chargingStation) {
      this.spinnerService.show();
      this.centralServerService
        .getChargingStationOcppParameters(this.chargingStation.id)
        .subscribe({
          next: (ocppParametersResult: DataResult<OcppParameter>) => {
            this.ocppParametersDataSource.setContent(ocppParametersResult.result);
            this.parameters.markAsPristine();
            this.spinnerService.hide();
          },
          error: (error) => {
            this.spinnerService.hide();
            switch (error.status) {
              case StatusCodes.NOT_FOUND:
                this.messageService.showErrorMessage('chargers.charger_not_found');
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
  }
}
