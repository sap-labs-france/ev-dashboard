import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'services/utils.service';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargePoint, ChargingStation } from '../../../types/ChargingStation';
import { KeyValue, RestResponse } from '../../../types/GlobalType';
import { HTTPAuthError, HTTPError } from '../../../types/HTTPError';
import { Utils } from '../../../utils/Utils';
import { ChargingStationParametersComponent } from './parameters/charging-station-parameters.component';

@Component({
  selector: 'app-charging-station',
  templateUrl: 'charging-station.component.html',
})
export class ChargingStationComponent implements OnInit {
  @Input() public chargingStationID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  @ViewChild('chargingStationParameters', { static: true }) public chargingStationParametersComponent!: ChargingStationParametersComponent;

  public formGroup: FormGroup;
  public chargingStation: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin!: boolean;
  public isProdLandscape!: boolean;

  public isPropertiesPaneDisabled = false;
  public isChargerPaneDisabled = false;
  public isOCPPParametersPaneDisabled = false;
  public activeTabIndex = 0;

  constructor(
    private authorizationService: AuthorizationService,
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialogService: DialogService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private router: Router) {
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    this.formGroup = new FormGroup({});
  }

  public ngOnInit() {
    // Load
    this.loadChargingStation();
    // Check auth
    if (!this.authorizationService.canUpdateChargingStation()
      && !this.authorizationService.isDemo()) {
      // Not authorized
      this.messageService.showErrorMessage(
        this.translateService.instant('chargers.action_error.not_authorized'));
      this.dialog.closeAll();
    }
    this.isAdmin = this.authorizationService.isAdmin();
    this.isProdLandscape = this.utilsService.isProdLandscape();
  }

  public loadChargingStation() {
    if (this.chargingStationID) {
      this.spinnerService.show();
      this.centralServerService.getChargingStation(this.chargingStationID).subscribe((chargingStation) => {
        this.spinnerService.hide();
        this.chargingStation = chargingStation;
        if (chargingStation) {
          this.isAdmin = this.authorizationService.isAdmin() ||
            this.authorizationService.isSiteAdmin(this.chargingStation.siteArea ? this.chargingStation.siteArea.siteID : '');
        }
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('chargers.charger_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'chargers.charger_not_found');
        }
      });
    }
  }

  public saveChargingStation(chargingStation: ChargingStation) {
    // Clone
    const chargingStationToSave = Utils.cloneObject(chargingStation) as ChargingStation;
    if (!chargingStationToSave.manualConfiguration) {
      // Do not save charge point
      delete chargingStationToSave.chargePoints;
    } else {
      for (const chargePoint of chargingStationToSave.chargePoints) {
        this.adjustChargePoints(chargingStationToSave, chargePoint);
      }
    }

    // Save
    this.spinnerService.show();
    this.centralServerService.updateChargingStationParams(chargingStationToSave).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('chargers.change_config_success',
          { chargeBoxID: this.chargingStation.id });
        this.closeDialog(true);
      } else {
        this.messageService.showErrorMessage('chargers.change_config_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('chargers.change_config_error');
          break;
        case HTTPError.THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA:
          this.messageService.showErrorMessage('chargers.change_config_phase_error');
          break;
        case HTTPError.CHARGING_STATION_RESET:
          this.messageService.showWarningMessage('chargers.charging_station_reset_error');
          this.closeDialog(true);
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'chargers.change_config_error');
      }
    });
  }

  public changeActivePane(tabChangedEvent: MatTabChangeEvent) {
    this.activeTabIndex = tabChangedEvent.index;
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService, this.translateService,
      this.saveChargingStation.bind(this), this.closeDialog.bind(this));
  }

  private adjustChargePoints(chargingStation: ChargingStation, chargePoint: ChargePoint) {
    delete chargePoint.numberOfConnectedPhase;
    chargePoint.amperage = 0;
    chargePoint.power = 0;
    for (const connectorID of chargePoint.connectorIDs) {
      const connector = Utils.getConnectorFromID(chargingStation, connectorID);
      chargePoint.amperage += connector.amperage;
      chargePoint.power += connector.power;
      chargePoint.numberOfConnectedPhase = connector.numberOfConnectedPhase;
    }
    console.log(chargePoint);
  }
}
