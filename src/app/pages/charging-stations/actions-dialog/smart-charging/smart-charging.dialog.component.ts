import {Component, Inject, ViewChild, AfterViewInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material';
import { Charger } from "../../../../common.types";
import { SmartChargingSimpleLimitComponent } from './simple-limit/smart-charging-simple-limit.component';
import { SmartChargingLimitPlanningComponent } from './limit-planning/smart-charging-limit-planning.component';
import { SmartChargingLimitPlannerComponent } from './limit-planner/smart-charging-limit-planner.component';
import { DialogService } from 'app/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { MessageService } from 'app/services/message.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-smart-charging-dialog-cmp',
  templateUrl: 'smart-charging.dialog.component.html'
})
export class ChargingStationSmartChargingDialogComponent implements AfterViewInit {
   charger: Charger;

  @ViewChild('simpleLimit') simpleLimitComponent: SmartChargingSimpleLimitComponent;
  @ViewChild('limitPlanning') limitPlanning: SmartChargingLimitPlanningComponent;
  @ViewChild('limitPlanner') limitPlanner: SmartChargingLimitPlannerComponent;
  constructor(
    private dialogRef: MatDialogRef<ChargingStationSmartChargingDialogComponent>,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.charger = data;
    }
  }

  ngAfterViewInit(): void {
    this.simpleLimitComponent.limitChanged(this.limitPlanning.internalFormatCurrentLimit);
  }

  limitChange(newValue) {
    if (this.simpleLimitComponent)
      this.simpleLimitComponent.limitChanged(newValue);
  }

  planningChanged(event) {
    if (this.limitPlanning) {
      this.limitPlanning.refresh();
    }
  }

  clearProfiles() {
    //show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', {'chargeBoxID': this.charger.id})//Math.round(this.powerSliderValue/1000)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        //call REST service
        this.centralServerService.chargingStationClearChargingProfile(this.charger).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              //success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.clear_profile_success'), {'chargeBoxID': this.charger.id});
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
            }
          }, (error) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.clear_profile_error'));
          });
      }
    });
  }
}
