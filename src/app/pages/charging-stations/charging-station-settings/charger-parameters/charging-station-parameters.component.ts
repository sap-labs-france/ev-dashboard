import { Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Charger, SiteArea } from '../../../../common.types';
import { LocaleService } from '../../../../services/locale.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../../services/central-server.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AuthorizationService } from '../../../../services/authorization-service';
import { MessageService } from '../../../../services/message.service';
import { Utils } from '../../../../utils/Utils';
import { CONNECTOR_TYPE_MAP } from '../../../../shared/formatters/app-connector-type.pipe';
import { SiteAreaDialogComponent } from '../site-area/site-area.dialog.component';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog-component';
import { Constants } from '../../../../utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import {ComponentEnum, ComponentService} from '../../../../services/component.service';

export const CONNECTED_PHASE_MAP =
  [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' }
  ]

export const POWER_UNIT_MAP =
  [
    { key: 'W', description: 'chargers.watt' },
    { key: 'A', description: 'chargers.amper' }
  ]

const URL_PATTERN = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;
@Component({
  selector: 'app-charging-station-parameters',
  styleUrls: ['../../charging-stations-data-source-table.scss', '../../../../shared/table/table.component.scss',
    './charging-station-parameters.scss'],
  templateUrl: './charging-station-parameters.html'
})
@Injectable()
export class ChargingStationParametersComponent implements OnInit {
  @Input() charger: Charger;
  @Input() dialogRef: MatDialogRef<any>;
  private messages;
  public userLocales;
  public isAdmin;

  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = CONNECTED_PHASE_MAP;
  public powerUnitMap = POWER_UNIT_MAP;

  public formGroup: FormGroup;
  public chargingStationURL: AbstractControl;
  public numberOfConnectedPhase: AbstractControl;
  public cannotChargeInParallel: AbstractControl;
  public powerLimitUnit: AbstractControl;
  public maximumPower: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public siteArea: AbstractControl;
  public siteAreaID: AbstractControl;

  public chargingStationURLTooltip: string;

  public isOrganizationComponentActive: boolean;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router) {

    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.formGroup = new FormGroup({});
    this.isOrganizationComponentActive = this.componentService.isActive(ComponentEnum.ORGANIZATION);
  }

  ngOnInit(): void {
    // Init the form
    this.formGroup = new FormGroup({
      'chargingStationURL': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(URL_PATTERN)
        ])),
      'numberOfConnectedPhase': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'powerLimitUnit': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'cannotChargeInParallel': new FormControl(''),
      'maximumPower': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[+]?[0-9]*$')
        ])),
      'siteArea': new FormControl(''),
      'siteAreaID': new FormControl(''),
      'latitude': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.max(90),
          Validators.min(-90),
          Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE)
        ])),
      'longitude': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.max(180),
          Validators.min(-180),
          Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE)
        ]))
    });
    // Form
    this.chargingStationURL = this.formGroup.controls['chargingStationURL'];
    this.numberOfConnectedPhase = this.formGroup.controls['numberOfConnectedPhase'];
    this.cannotChargeInParallel = this.formGroup.controls['cannotChargeInParallel'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.powerLimitUnit = this.formGroup.controls['powerLimitUnit'];
    this.latitude = this.formGroup.controls['latitude'];
    this.longitude = this.formGroup.controls['longitude'];

    // Deactivate for non admin users
    if (!this.isAdmin) {
      this.cannotChargeInParallel.disable();
      this.chargingStationURL.disable();
      this.numberOfConnectedPhase.disable();
      this.maximumPower.disable();
      this.powerLimitUnit.disable();
      this.latitude.disable();
      this.longitude.disable();
      this.siteArea.disable();
      this.siteAreaID.disable();
    }

    // URL not editable in case OCPP v1.6 or above
    if (Number(this.charger.ocppVersion) >= 1.6) {
      this.chargingStationURL.disable();
      this.chargingStationURLTooltip = 'chargers.dialog.settings.fixedURLforOCPP';
    } else {
      this.chargingStationURLTooltip = 'chargers.dialog.settings.callbackURLforOCPP';
    }

    // add connectors formcontrol
    for (const connector of this.charger.connectors) {
      const connectorTypeId = `connectorType${connector.connectorId}`;
      const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
      this.formGroup.addControl(connectorTypeId, new FormControl(''));
      this.formGroup.addControl(connectorMaxPowerId, new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[+]?[0-9]*$')
        ])));
      if (!this.isAdmin) {
        this.formGroup.controls[connectorTypeId].disable();
        this.formGroup.controls[connectorMaxPowerId].disable();
      }
    }
    if (this.charger.id) {
      this.loadChargeBoxID();
    }
  }

  /**
   * refresh
   */
  public refresh() {
    this.loadChargeBoxID();
  }

  public loadChargeBoxID() {
    if (!this.charger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargers({ ChargeBoxID: this.charger.id, 'WithSite': true }).subscribe((chargerResult) => {
      this.charger = chargerResult.result[0];

      // Init form
      if (this.charger.chargingStationURL) {
        this.formGroup.controls.chargingStationURL.setValue(this.charger.chargingStationURL);
        this.formGroup.controls.chargingStationURL.updateValueAndValidity();
      }
      if (this.charger.numberOfConnectedPhase) {
        this.formGroup.controls.numberOfConnectedPhase.setValue(this.charger.numberOfConnectedPhase);
      }
      if (this.charger.cannotChargeInParallel) {
        this.formGroup.controls.cannotChargeInParallel.setValue(this.charger.cannotChargeInParallel);
      }
      if (this.charger.powerLimitUnit) {
        this.formGroup.controls.powerLimitUnit.setValue(this.charger.powerLimitUnit);
      }
      if (this.charger.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.charger.maximumPower);
      }
      if (this.charger.latitude) {
        this.formGroup.controls.latitude.setValue(this.charger.latitude);
      }
      if (this.charger.longitude) {
        this.formGroup.controls.longitude.setValue(this.charger.longitude);
      }
      if (this.charger.siteArea && this.charger.siteArea.name) {
        // tslint:disable-next-line:max-line-length
        this.formGroup.controls.siteArea.setValue(`${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
      } else {
        if (this.isOrganizationComponentActive) {
          this.formGroup.controls.siteAreaID.setValue(0);
          this.formGroup.controls.siteArea.setValue(this.translateService.instant('site_areas.unassigned'))
        } else {
          this.formGroup.controls.siteAreaID.setValue('');
          this.formGroup.controls.siteArea.setValue('');
          this.formGroup.controls.siteAreaID.markAsPristine();
          this.formGroup.controls.siteArea.markAsPristine();
          this.formGroup.controls.siteArea.disable();
          this.formGroup.controls.siteAreaID.disable();
        }
      }
      // Update connectors formcontrol
      for (const connector of this.charger.connectors) {
        const connectorTypeId = `connectorType${connector.connectorId}`;
        const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
        this.formGroup.controls[connectorTypeId].setValue(connector.type);
        this.formGroup.controls[connectorMaxPowerId].setValue(connector.power);
      }
      this.formGroup.markAsPristine();
      this.spinnerService.hide();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['charger_not_found']);
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public saveChargeBox() {
    if (this.charger.id) {
      // Map dialog inputs to object model
      this.charger.chargingStationURL = this.chargingStationURL.value;
      this.charger.maximumPower = this.maximumPower.value;
      this.charger.numberOfConnectedPhase = this.numberOfConnectedPhase.value;
      this.charger.cannotChargeInParallel = this.cannotChargeInParallel.value;
      this.charger.powerLimitUnit = this.powerLimitUnit.value;
      this.charger.latitude = this.latitude.value;
      this.charger.longitude = this.longitude.value;
      for (const connector of this.charger.connectors) {
        connector.type = this.formGroup.controls[`connectorType${connector.connectorId}`].value;
        connector.power = this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].value;
      }
      this._updateChargeBoxID();
    }
  }

  public assignSiteArea() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    if (this.charger) {
      dialogConfig.data = this.charger;
    }
    // Open
    this.dialog.open(SiteAreaDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        this.charger.siteArea = <SiteArea>result[0];
        // tslint:disable-next-line:max-line-length
        this.formGroup.controls.siteArea.setValue(`${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
        this.formGroup.controls.siteArea.markAsDirty();
      });
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.disableClose = true;

    // get latitud/longitude from form
    let latitude = this.formGroup.controls.latitude.value;
    let longitude = this.formGroup.controls.longitude.value;

    // if one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      const siteArea = this.charger.siteArea;

      if (siteArea && siteArea.address) {
        if (siteArea.address.latitude && siteArea.address.longitude) {
          latitude = siteArea.address.latitude;
          longitude = siteArea.address.longitude;
        } else {
          const site = siteArea.site;

          if (site && site.address && site.address.latitude && site.address.longitude) {
            latitude = site.address.latitude;
            longitude = site.address.longitude;
          }
        }
      }
    }

    // Set data
    dialogConfig.data = {
      dialogTitle: this.translateService.instant('geomap.dialog_geolocation_title', { chargeBoxID: this.charger.id }),
      latitude: latitude,
      longitude: longitude,
      label: this.charger.id ? this.charger.id : ''
    }

    // Open
    this.dialog.open(GeoMapDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        if (result) {
          if (result.latitude) {
            this.formGroup.controls.latitude.setValue(result.latitude);
            this.formGroup.controls.latitude.markAsDirty();
            this.formGroup.controls.latitude.markAsPending();
          }
          if (result.longitude) {
            this.formGroup.controls.longitude.setValue(result.longitude);
            this.formGroup.controls.longitude.markAsDirty();
            this.formGroup.controls.longitude.markAsPending();
          }
        }
      });
  }

  private _updateChargeBoxID() {
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateChargingStationParams(this.charger).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        // tslint:disable-next-line:max-line-length
        this.messageService.showSuccessMessage(this.translateService.instant('chargers.change_config_success', { chargeBoxID: this.charger.id }));
        this.closeDialog();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['change_config_error']);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        case 560:
          // Not Authorized
          this.messageService.showErrorMessage(
            this.translateService.instant('chargers.change_config_error'));
          break;
        case 550:
          // Does not exist
          this.messageService.showErrorMessage(this.messages['change_config_error']);
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['change_config_error']);
      }
    });
  }

  public closeDialog() {
    if ( this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text')
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text')
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_SAVE_AND_CLOSE) {
          this.saveChargeBox();
        } else if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }
}
