// tslint:disable-next-line:max-line-length
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AbstractControl, Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStation, Connector } from 'app/types/ChargingStation';
import { ActionResponse } from 'app/types/DataResult';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-debug',
  templateUrl: './charging-station-debug.component.html',
})
@Injectable()
export class ChargingStationDebugComponent implements OnInit {
  @Input() charger!: ChargingStation;

  public formGroup!: FormGroup;
  public connectorControl!: AbstractControl;
  public connectorIds: string[];
  public loadAllConnectors = false;
  public scheduleResult!: ActionResponse;
  public durationControl!: AbstractControl;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private router: Router) {
    this.connectorIds = [];
  }

  ngOnInit() {
    // Set
    for (const connector of this.charger.connectors) {
      this.connectorIds.push(connector.connectorId as unknown as string);
    }
    this.connectorIds.push(this.translateService.instant('chargers.smart_charging.connectors_all') as string);

    // Init the form
    this.formGroup = new FormGroup({
      connectorControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      durationControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });

    this.connectorControl = this.formGroup.controls['connectorControl'];
    this.durationControl = this.formGroup.controls['durationControl'];
  }

  public getChargingProfilesForConnector() {
    if (!this.charger) {
      return;
    }
    this.spinnerService.show();

    this.loadAllConnectors = false;
    let connector: number = this.connectorControl.value as number;
    if (this.connectorControl.value === this.translateService.instant('chargers.smart_charging.connectors_all')) {
      this.loadAllConnectors = true;
      connector = 0;
    }

    this.centralServerService.getChargingStationCompositeSchedule(
      this.charger.id, connector, this.durationControl.value as number,
      this.charger.powerLimitUnit, this.loadAllConnectors).subscribe((chargingSchedule) => {
      this.scheduleResult = chargingSchedule;
      this.spinnerService.hide();
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      // Unexpected error`
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, this.translateService.instant('general.unexpected_error_backend'));
      this.scheduleResult = error;
    });
  }
}
