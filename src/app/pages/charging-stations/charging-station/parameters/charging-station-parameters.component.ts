import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog.component';
import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { ChargingStation, ChargingStationCurrentType, ConnectorCurrentType, OCPPProtocol } from 'app/types/ChargingStation';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { CONNECTOR_TYPE_MAP } from '../../../../shared/formatters/app-connector-type.pipe';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-parameters',
  templateUrl: './charging-station-parameters.component.html',
})
@Injectable()
export class ChargingStationParametersComponent implements OnInit {
  @Input() charger!: ChargingStation;
  @Input() dialogRef!: MatDialogRef<any>;
  public userLocales: KeyValue[];
  public isAdmin!: boolean;

  public currentTypeMap = [
    { key: ChargingStationCurrentType.AC, description: 'chargers.alternating_current' },
    { key: ChargingStationCurrentType.DC, description: 'chargers.direct_current' },
    {
      key: ChargingStationCurrentType.AC_DC,
      description: 'chargers.direct_and_alternating_current',
    },
  ];
  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
    { key: 0, description: 'chargers.direct_current' },
  ];
  public formGroup: FormGroup;
  public chargingStationURL!: AbstractControl;
  public cannotChargeInParallel!: AbstractControl;
  public private!: AbstractControl;
  public issuer!: AbstractControl;
  public currentType!: AbstractControl;
  public maximumPower!: AbstractControl;
  public coordinates!: FormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;

  public chargingStationURLTooltip!: string;

  public isOrganizationComponentActive: boolean;
  private messages!: any;

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
    this.formGroup = new FormGroup({});
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
  }

  ngOnInit(): void {
    // Admin?
    this.isAdmin = this.authorizationService.isSiteAdmin(this.charger.siteArea ? this.charger.siteArea.siteID : '');

    // Init the form
    this.formGroup = new FormGroup({
      chargingStationURL: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      currentType: new FormControl(''),
      cannotChargeInParallel: new FormControl(''),
      private: new FormControl(''),
      issuer: new FormControl(''),
      maximumPower: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])),
      siteArea: new FormControl(''),
      siteAreaID: new FormControl(''),
      coordinates: new FormArray([
        new FormControl('',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
          ])),
        new FormControl('',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
          ])),
      ]),
    });
    // Form
    this.chargingStationURL = this.formGroup.controls['chargingStationURL'];
    this.cannotChargeInParallel = this.formGroup.controls['cannotChargeInParallel'];
    this.private = this.formGroup.controls['private'];
    this.issuer = this.formGroup.controls['issuer'];
    this.currentType = this.formGroup.controls['currentType'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.coordinates = this.formGroup.controls['coordinates'] as FormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);

    this.formGroup.updateValueAndValidity();

    // Deactivate for non admin users
    if (!this.isAdmin) {
      this.private.disable();
      this.cannotChargeInParallel.disable();
      this.chargingStationURL.disable();
      this.latitude.disable();
      this.longitude.disable();
      this.siteArea.disable();
      this.siteAreaID.disable();
    }
    this.currentType.disable();
    this.maximumPower.disable();
    // URL not editable in case OCPP v1.6 or above
    if (this.charger.ocppProtocol === OCPPProtocol.JSON) {
      this.chargingStationURL.disable();
      this.chargingStationURLTooltip = 'chargers.dialog.settings.fixedURLforOCPP';
    } else {
      this.chargingStationURLTooltip = 'chargers.dialog.settings.callbackURLforOCPP';
    }

    // add connectors formcontrol
    for (const connector of this.charger.connectors) {
      const connectorTypeId = `connectorType${connector.connectorId}`;
      const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
      const connectorVoltageId = `connectorVoltage${connector.connectorId}`;
      const connectorAmperageId = `connectorAmperage${connector.connectorId}`;
      const numberOfConnectedPhaseId = `numberOfConnectedPhase${connector.connectorId}`;
      this.formGroup.addControl(connectorTypeId, new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[^U]*$'),
        ])));
      this.formGroup.addControl(connectorMaxPowerId, new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])));
      this.formGroup.addControl(connectorVoltageId, new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])));
      this.formGroup.addControl(connectorAmperageId, new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])));
      this.formGroup.addControl(numberOfConnectedPhaseId, new FormControl('',
        Validators.compose([
          Validators.required,
        ])));
      if (!this.isAdmin) {
        this.formGroup.controls[connectorTypeId].disable();
        this.formGroup.controls[connectorVoltageId].disable();
        this.formGroup.controls[connectorAmperageId].disable();
        this.formGroup.controls[numberOfConnectedPhaseId].disable();
      }
      this.formGroup.controls[connectorMaxPowerId].disable();
    }
    if (this.charger.id) {
      this.loadChargingStation();
    }
  }

  public refresh() {
    this.loadChargingStation();
  }

  public numberOfPhaseChanged() {
    // Update Voltage
    for (const connector of this.charger.connectors) {
      const connectorVoltControl = this.formGroup.controls[`connectorVoltage${connector.connectorId}`];
      const numberOfConnectedPhaseControl = this.formGroup.controls[`numberOfConnectedPhase${connector.connectorId}`];
      if (numberOfConnectedPhaseControl.value === 1) {
        // Monophase AC
        connectorVoltControl.setValue(230);
      } else if (numberOfConnectedPhaseControl.value === 3) {
        // Triphase AC
        connectorVoltControl.setValue(400);
      }
    }
    this.refreshChargingStationPower();
  }

  public refreshChargingStationPower() {
    if (!this.charger.issuer) {
      return;
    }
    let chargerMaxPower = 0;
    let currentTypeDC = false;
    let currentTypeAC = false;
    if (this.currentType.value === ChargingStationCurrentType.AC) {
      this.maximumPower.disable();
    } else {
      this.maximumPower.enable();
    }
    for (const connector of this.charger.connectors) {
      const connectorVoltControl = this.formGroup.controls[`connectorVoltage${connector.connectorId}`];
      const connectorAmpControl = this.formGroup.controls[`connectorAmperage${connector.connectorId}`];
      const numberOfConnectedPhaseControl = this.formGroup.controls[`numberOfConnectedPhase${connector.connectorId}`];
      const connectorMaxPowerControl = this.formGroup.controls[`connectorMaxPower${connector.connectorId}`];

      if (connectorVoltControl.value && connectorAmpControl.value && numberOfConnectedPhaseControl.value >= 0) {
        // Compute Conector's Power
        let connectorMaxPower = 0;
        if (numberOfConnectedPhaseControl.value === 1) {
          // Monophase AC
          currentTypeAC = true;
          connectorMaxPower = Math.floor(connectorVoltControl.value * connectorAmpControl.value);
          connectorMaxPowerControl.disable();
        } else if (numberOfConnectedPhaseControl.value === 3) {
          // Triphase AC
          currentTypeAC = true;
          connectorMaxPower = Math.floor(connectorVoltControl.value * connectorAmpControl.value
            * Math.sqrt(numberOfConnectedPhaseControl.value));
          connectorMaxPowerControl.disable();
        } else {
          // Direct Current
          currentTypeDC = true;
          connectorMaxPowerControl.enable();
        }
        if (connectorMaxPower) {
          // Connector Max Power
          connectorMaxPowerControl.setValue(connectorMaxPower);
          // Charger Max Power
          chargerMaxPower += connectorMaxPower;
        }
      }
    }
    // Set Charger Max Power
    if (chargerMaxPower) {
      this.maximumPower.setValue(chargerMaxPower);
    }
    // Set Current Type
    if (currentTypeDC && currentTypeAC) {
      this.currentType.setValue(ChargingStationCurrentType.AC_DC);
    } else if (currentTypeDC && !currentTypeAC) {
      this.currentType.setValue(ChargingStationCurrentType.DC);
    } else if (!currentTypeDC && currentTypeAC) {
      this.currentType.setValue(ChargingStationCurrentType.AC);
    }
  }

  public loadChargingStation() {
    if (!this.charger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getCharger(this.charger.id).subscribe((chargerResult) => {
      this.spinnerService.hide();
      this.charger = chargerResult;
      // Init form
      if (this.charger.chargingStationURL) {
        this.formGroup.controls.chargingStationURL.setValue(this.charger.chargingStationURL);
      }
      if (this.charger.currentType !== ChargingStationCurrentType.AC) {
        this.maximumPower.enable();
      } else {
        this.maximumPower.disable();
      }
      if (this.charger.cannotChargeInParallel) {
        this.formGroup.controls.cannotChargeInParallel.setValue(this.charger.cannotChargeInParallel);
      }
      if (this.charger.private) {
        this.formGroup.controls.private.setValue(this.charger.private);
      }
      if (this.charger.issuer) {
        this.formGroup.controls.issuer.setValue(this.charger.issuer);
      }
      if (this.charger.currentType) {
        this.formGroup.controls.currentType.setValue(this.charger.currentType);
      }
      if (this.charger.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.charger.maximumPower);
      }
      if (this.charger.coordinates) {
        this.longitude.setValue(this.charger.coordinates[0]);
        this.latitude.setValue(this.charger.coordinates[1]);
      }
      if (this.charger.siteArea && this.charger.siteArea.name) {
        // tslint:disable-next-line:max-line-length
        this.formGroup.controls.siteArea.setValue(`${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
      } else {
        if (this.isOrganizationComponentActive) {
          this.formGroup.controls.siteAreaID.setValue(0);
          this.formGroup.controls.siteArea.setValue(this.translateService.instant('site_areas.unassigned'));
        } else {
          this.formGroup.controls.siteAreaID.setValue('');
          this.formGroup.controls.siteArea.setValue('');
          this.formGroup.controls.siteArea.disable();
          this.formGroup.controls.siteAreaID.disable();
        }
      }
      // Update connectors formcontrol
      for (const connector of this.charger.connectors) {
        this.formGroup.controls[`connectorType${connector.connectorId}`].setValue(connector.type ? connector.type : 'U');
        this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].setValue(connector.power);
        this.formGroup.controls[`connectorVoltage${connector.connectorId}`].setValue(connector.voltage);
        this.formGroup.controls[`connectorAmperage${connector.connectorId}`].setValue(connector.amperage);
        this.formGroup.controls[`numberOfConnectedPhase${connector.connectorId}`].setValue(connector.numberOfConnectedPhase);
        // DC?
        if (connector.numberOfConnectedPhase === 0) {
          this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].enable();
        } else {
          this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].disable();
        }
      }
      if (!this.charger.issuer) {
        this.formGroup.disable();
      }
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, this.messages['charger_not_found']);
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
      this.charger.cannotChargeInParallel = this.cannotChargeInParallel.value;
      this.charger.private = this.private.value;
      this.charger.currentType = this.currentType.value;
      if (this.longitude.value && this.latitude.value) {
        this.charger.coordinates = [this.longitude.value, this.latitude.value];
      } else {
        delete this.charger.coordinates;
      }
      for (const connector of this.charger.connectors) {
        connector.type = this.formGroup.controls[`connectorType${connector.connectorId}`].value;
        connector.power = this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].value;
        connector.voltage = this.formGroup.controls[`connectorVoltage${connector.connectorId}`].value;
        connector.amperage = this.formGroup.controls[`connectorAmperage${connector.connectorId}`].value;
        connector.numberOfConnectedPhase = this.formGroup.controls[`numberOfConnectedPhase${connector.connectorId}`].value;
        if (connector.numberOfConnectedPhase === 0) {
          connector.currentType = ConnectorCurrentType.DC;
        } else {
          connector.currentType = ConnectorCurrentType.AC;
        }
      }
      this.updateChargeBoxID();
    }
  }

  public assignSiteArea() {
    if (!this.charger.issuer) {
      return;
    }
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'chargers.assign_site_area',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
      if (result && result.length > 0 && result[0] && result[0].objectRef) {
        this.charger.siteArea = ((result[0].objectRef) as SiteArea);
        this.formGroup.markAsDirty();
        this.formGroup.controls.siteArea.setValue(
          `${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
      }
    });
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'transparent-dialog-container';

    // get latitud/longitude from form
    let latitude = this.latitude.value;
    let longitude = this.longitude.value;

    // if one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      const siteArea = this.charger.siteArea;

      if (siteArea && siteArea.address) {
        if (siteArea.address.coordinates && siteArea.address.coordinates.length === 2) {
          latitude = siteArea.address.coordinates[1];
          longitude = siteArea.address.coordinates[0];
        } else {
          const site = siteArea.site;

          if (site && site.address && site.address.coordinates && site.address.coordinates.length === 2) {
            latitude = site.address.coordinates[1];
            longitude = site.address.coordinates[0];
          }
        }
      }
    }

    // Set data
    dialogConfig.data = {
      dialogTitle: this.translateService.instant('geomap.dialog_geolocation_title',
        { componentName: 'Charging Station', itemComponentName: this.charger.id }),
      latitude,
      longitude,
      label: this.charger.id ? this.charger.id : '',
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(GeoMapDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
      if (result) {
        if (result.latitude) {
          this.latitude.setValue(result.latitude);
          this.formGroup.markAsDirty();
        }
        if (result.longitude) {
          this.longitude.setValue(result.longitude);
          this.formGroup.markAsDirty();
        }
      }
    });
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.SAVE_AND_CLOSE) {
          this.saveChargeBox();
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private updateChargeBoxID() {
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateChargingStationParams(this.charger).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        // tslint:disable-next-line:max-line-length
        this.messageService.showSuccessMessage(
          this.translateService.instant('chargers.change_config_success', { chargeBoxID: this.charger.id }));
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['change_config_error']);
      }
    }, (error) => {
      this.spinnerService.hide();
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
}
