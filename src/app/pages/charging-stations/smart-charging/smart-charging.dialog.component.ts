import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Charger } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { SmartChargingLimitPlannerComponent } from './limit-planner/smart-charging-limit-planner.component';
import { SmartChargingLimitPlanningComponent } from './limit-planning/smart-charging-limit-planning.component';
import { SmartChargingMasterLimitComponent } from './master-limit/smart-charging-master-limit.component';

@Component({
  selector: 'app-smart-charging-dialog-cmp',
  templateUrl: 'smart-charging.dialog.component.html'
})
export class ChargingStationSmartChargingDialogComponent implements AfterViewInit {
  charger: Charger;

  @ViewChild('masterLimit', { static: false }) masterLimitComponent: SmartChargingMasterLimitComponent;
  @ViewChild('limitPlanning', { static: false }) limitPlanning: SmartChargingLimitPlanningComponent;
  @ViewChild('limitPlanner', { static: false }) limitPlanner: SmartChargingLimitPlannerComponent;

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
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  ngAfterViewInit(): void {
  }

  limitChange(newValue) {
    if (this.masterLimitComponent) {
      this.masterLimitComponent.limitChanged(newValue);
    }
  }

  planningChanged(event) {
    if (this.limitPlanning) {
      this.limitPlanning.refresh();
    }
  }

  clearProfiles() {
    // show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', { 'chargeBoxID': this.charger.id })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        // call REST service
        this.centralServerService.chargingStationClearChargingProfile(this.charger).subscribe(response => {
          if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
            // success + reload
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.clear_profile_success',
              { 'chargeBoxID': this.charger.id }));
            this.limitPlanning.refresh();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
          }
        }, (error) => {
          this.spinnerService.hide();
          this.dialog.closeAll();
          Utils.handleHttpError(
            error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.clear_profile_error');
        });
      }
    });
  }
}
