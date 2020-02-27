// tslint:disable-next-line:max-line-length
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStation } from 'app/types/ChargingStation';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { ButtonType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-static-limit',
  templateUrl: './charging-station-static-limit.component.html',
})
@Injectable()
export class ChargingStationStaticLimitComponent implements OnInit {
  @Input() charger!: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin: boolean;
  public ampInitialLimit = 0;
  public ampCurrentLimit = 0;

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

    // Check Auth
    if (!authorizationService.canUpdateChargingStation()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
    // Set
    for (const connector of this.charger.connectors) {
      this.ampCurrentLimit += connector.amperageLimit;
    }
    this.ampInitialLimit = this.ampCurrentLimit;
  }

  public saveAndApplyStaticLimit() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Apply to charger
        this.spinnerService.show();
        this.centralServerService.chargingStationLimitPower(this.charger, 0, this.ampCurrentLimit).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // success + reload
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.smart_charging.power_limit_success', { chargeBoxID: self.charger.id }),
            );
            // Refresh
            this.loadChargingStation();
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
    });
  }

  public loadChargingStation() {
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getCharger(this.charger.id).subscribe((charger) => {
      this.spinnerService.hide();
      // Update connectors
      for (const connector of this.charger.connectors) {
        this.charger.connectors[connector.connectorId-1] = connector;
      }
    }, (error) => {
      // Do nothing
    });
  }

  public powerSliderChanged(ampValue: number) {
    this.ampCurrentLimit = ampValue;
  }
}
