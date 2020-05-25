import { Component, Injectable, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService } from 'app/services/component.service';
import { DialogService } from 'app/services/dialog.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargePoint, ChargingStation, OCPPConfigurationStatus } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { ButtonType } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';

import { TableChargingStationsRebootAction } from '../../table-actions/table-charging-stations-reboot-action';

@Component({
  selector: 'app-charging-station-static-limit',
  templateUrl: './charging-station-static-limit.component.html',
})
@Injectable()
export class ChargingStationStaticLimitComponent {
  @Input() public chargingStation!: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin: boolean;
  public isSmartChargingComponentActive = false;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService) {

    // Check Auth
    if (!authorizationService.canUpdateChargingStation()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public applyStaticLimitConfirm(chargePoint: ChargePoint) {
    // Confirm dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm', { chargeBoxID: this.chargingStation.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.spinnerService.show();
        this.centralServerService.getChargingProfiles(this.chargingStation.id).subscribe((chargingProfilesResult) => {
          this.spinnerService.hide();
          let foundLimitIsExeeded = false;
          if (chargingProfilesResult.count > 0) {
            // Check schedules
            for (const chargingProfile of chargingProfilesResult.result) {
              if (chargingProfile.profile && chargingProfile.profile.chargingSchedule &&
                  chargingProfile.profile.chargingSchedule.chargingSchedulePeriod) {
                for (const chargingSchedulePeriod of chargingProfile.profile.chargingSchedule.chargingSchedulePeriod) {
                  // Check the limit max is beyond the new values
                  if (chargingSchedulePeriod.limit > chargePoint.ampCurrentLimit) {
                    foundLimitIsExeeded = true;
                    break;
                  }
                }
              }
              if (foundLimitIsExeeded) {
                break;
              }
            }
          }
          // New limit impacts the charging plans?
          if (foundLimitIsExeeded) {
            // Yes: Confirm dialog
            this.dialogService.createAndShowYesNoDialog(
              this.translateService.instant('chargers.smart_charging.power_limit_has_charging_plan_title'),
              this.translateService.instant('chargers.smart_charging.power_limit_has_charging_plan_confim'),
            ).subscribe((subresult) => {
              if (subresult === ButtonType.YES) {
                // No: Apply it right away
                this.applyStaticLimit(chargePoint, true);
              }
            });
          } else {
            // No: Apply it right away
            this.applyStaticLimit(chargePoint);
          }
        }, (error: any) => {
          this.spinnerService.hide();
          Utils.handleHttpError(
            error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_error');
        });
      }
    });
  }

  public powerSliderChanged(chargePoint: ChargePoint, ampValue: number) {
    chargePoint.ampCurrentLimit = ampValue;
  }

  private applyStaticLimit(chargePoint: ChargePoint, forceUpdateChargingPlan?: boolean) {
    // Apply to chargingStation
    this.spinnerService.show();
    // tslint:disable-next-line: max-line-length
    this.centralServerService.chargingStationLimitPower(
        this.chargingStation, chargePoint, 0, chargePoint.ampCurrentLimit, forceUpdateChargingPlan).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === OCPPConfigurationStatus.ACCEPTED ||
          response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
        // Success
        this.messageService.showSuccessMessage(
          // tslint:disable-next-line: max-line-length
          this.translateService.instant('chargers.smart_charging.power_limit_success', { chargeBoxID: this.chargingStation.id, forceUpdateChargingPlan }),
        );
        // Reboot Required?
        if (response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
          const chargingStationsRebootAction = new TableChargingStationsRebootAction().getActionDef();
          if (chargingStationsRebootAction.action) {
            chargingStationsRebootAction.action(this.chargingStation, this.dialogService, this.translateService,
              this.messageService, this.centralServerService, this.spinnerService, this.router);
          }
        }
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
      }
    }, (error: any) => {
      this.spinnerService.hide();
      Utils.handleHttpError(
        error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_error');
    });
  }
}
