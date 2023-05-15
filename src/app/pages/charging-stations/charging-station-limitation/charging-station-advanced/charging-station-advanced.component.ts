import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { GetCompositeScheduleCommandResult } from '../../../../types/ChargingProfile';
import { ChargingStation } from '../../../../types/ChargingStation';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-advanced',
  templateUrl: 'charging-station-advanced.component.html',
})
// @Injectable()
export class ChargingStationAdvancedComponent implements OnInit {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargingStationsAuthorizations!: ChargingStationsAuthorizations;

  public formGroup!: UntypedFormGroup;
  public connectorControl!: AbstractControl;
  public connectorIds: string[];
  public scheduleResult!: GetCompositeScheduleCommandResult | GetCompositeScheduleCommandResult[];
  public durationControl!: AbstractControl;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.connectorIds = [];
  }

  public ngOnInit() {
    // Set
    for (const connector of this.chargingStation.connectors) {
      this.connectorIds.push(connector.connectorId.toString());
    }
    this.connectorIds.push(
      this.translateService.instant('chargers.smart_charging.connectors_all').toString()
    );

    // Init the form
    this.formGroup = new UntypedFormGroup({
      connectorControl: new UntypedFormControl(
        this.translateService.instant('chargers.smart_charging.connectors_all'),
        Validators.compose([Validators.required])
      ),
      durationControl: new UntypedFormControl(600, Validators.compose([Validators.required])),
    });

    this.connectorControl = this.formGroup.controls['connectorControl'];
    this.durationControl = this.formGroup.controls['durationControl'];
  }

  public getChargingProfilesForConnector() {
    if (!this.chargingStation) {
      return;
    }
    this.spinnerService.show();
    // Connector ID
    let connectorID: number = this.connectorControl.value as number;
    if (
      this.connectorControl.value ===
      this.translateService.instant('chargers.smart_charging.connectors_all')
    ) {
      connectorID = 0;
    }
    // Duration
    const durationSecs = (this.durationControl.value as number) * 60;
    this.centralServerService
      .getChargingStationCompositeSchedule(
        this.chargingStation.id,
        connectorID,
        durationSecs,
        this.chargingStation.powerLimitUnit
      )
      .subscribe({
        next: (chargingSchedule) => {
          this.scheduleResult = chargingSchedule;
          this.spinnerService.hide();
          this.formGroup.markAsPristine();
        },
        error: (error) => {
          this.spinnerService.hide();
          // Unexpected error`
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            this.translateService.instant('general.unexpected_error_backend')
          );
          this.scheduleResult = error;
        },
      });
  }
}
