import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { UtilsService } from 'services/utils.service';
import { ChargingStationsAuthorizations, DialogMode } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargingStation } from '../../../types/ChargingStation';
import { KeyValue, RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { Utils } from '../../../utils/Utils';
import { ChargingStationParametersComponent } from './parameters/charging-station-parameters.component';

@Component({
  selector: 'app-charging-station',
  templateUrl: 'charging-station.component.html',
  styleUrls: ['charging-station.component.scss'],
})
export class ChargingStationComponent implements OnInit {
  @Input() public chargingStationID!: string;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public dialogMode!: DialogMode;
  @Input() public chargingStationsAuthorizations!: ChargingStationsAuthorizations;

  @ViewChild('chargingStationParameters', { static: true })
  public chargingStationParametersComponent!: ChargingStationParametersComponent;

  public formGroup: UntypedFormGroup;
  public chargingStation: ChargingStation;
  public userLocales: KeyValue[];
  public isProdLandscape!: boolean;

  public canUpdate: boolean;
  public canGetParameters: boolean;
  public readOnly = true;
  public isPropertiesPaneDisabled = false;
  public isChargerPaneDisabled = false;
  public isOCPPParametersPaneDisabled = false;
  public activeTabIndex = 0;

  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialogService: DialogService,
    protected activatedRoute: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router
  ) {
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    this.formGroup = new UntypedFormGroup({});
  }

  public ngOnInit() {
    this.isProdLandscape = this.utilsService.isProdLandscape();
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Load Charging Station
    this.loadChargingStation();
  }

  public loadChargingStation() {
    if (this.chargingStationID) {
      this.spinnerService.show();
      this.centralServerService.getChargingStation(this.chargingStationID).subscribe({
        next: (chargingStation) => {
          this.spinnerService.hide();
          // Init auth
          this.chargingStation = chargingStation;
          if (this.readOnly || !this.chargingStation.issuer) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
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
                'chargers.charger_not_found'
              );
          }
        },
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
      Utils.adjustChargePoints(chargingStationToSave);
    }
    // Save
    this.spinnerService.show();
    this.centralServerService.updateChargingStationParams(chargingStationToSave).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('chargers.change_config_success', {
            chargeBoxID: this.chargingStation.id,
          });
          this.closeDialog(true);
        } else {
          this.messageService.showErrorMessage('chargers.change_config_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('chargers.change_config_error');
            break;
          case HTTPError.THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA:
            this.messageService.showErrorMessage('chargers.change_config_phase_error');
            break;
          case HTTPError.CHARGE_POINT_NOT_VALID:
            this.messageService.showErrorMessage('chargers.charge_point_connectors_error');
            break;
          case HTTPError.FEATURE_NOT_SUPPORTED_ERROR:
            this.messageService.showErrorMessage('chargers.update_public_cs_error');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'chargers.change_config_error'
            );
        }
      },
    });
  }

  public changeActivePane(tabChangedEvent: MatTabChangeEvent) {
    this.activeTabIndex = tabChangedEvent.index;
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveChargingStation.bind(this),
      this.closeDialog.bind(this)
    );
  }
}
