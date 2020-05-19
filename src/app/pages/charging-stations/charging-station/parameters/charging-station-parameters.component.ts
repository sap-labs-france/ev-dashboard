import { Component, Injectable, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog.component';
import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { ChargingStation, ChargingStationCurrentType, ConnectorCurrentType, OCPPProtocol } from 'app/types/ChargingStation';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { HTTPAuthError, HTTPError } from 'app/types/HTTPError';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { LocaleService } from '../../../../services/locale.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-parameters',
  templateUrl: './charging-station-parameters.component.html',
})
@Injectable()
export class ChargingStationParametersComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public dialogRef!: MatDialogRef<any>;
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
  public formGroup: FormGroup;
  public chargingStationURL!: AbstractControl;
  public private!: AbstractControl;
  public issuer!: AbstractControl;
  public maximumPower!: AbstractControl;
  public coordinates!: FormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public connectors!: FormArray;

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

  public ngOnInit(): void {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() ||
      this.authorizationService.isSiteAdmin(this.chargingStation.siteArea ?
        this.chargingStation.siteArea.siteID : '');
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      chargingStationURL: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN),
        ])),
      private: new FormControl(false),
      issuer: new FormControl(false),
      maximumPower: new FormControl(0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])),
      siteArea: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      siteAreaID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      connectors: new FormArray([]),
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
    this.private = this.formGroup.controls['private'];
    this.issuer = this.formGroup.controls['issuer'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.coordinates = this.formGroup.controls['coordinates'] as FormArray;
    this.connectors =  this.formGroup.controls['connectors'] as FormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    this.formGroup.updateValueAndValidity();
    // Deactivate for non admin users
    if (!this.isAdmin) {
      this.private.disable();
      this.chargingStationURL.disable();
      this.latitude.disable();
      this.longitude.disable();
      this.siteArea.disable();
      this.siteAreaID.disable();
    }
    this.maximumPower.disable();
  }

  public ngOnChanges() {
    // Load values
    this.loadChargingStation();
  }

  public loadChargingStation() {
    if (this.chargingStation) {
      // Init form with values
      this.formGroup.controls.id.setValue(this.chargingStation.id);
      if (this.chargingStation.chargingStationURL) {
        this.formGroup.controls.chargingStationURL.setValue(this.chargingStation.chargingStationURL);
      }
      if (this.chargingStation.private) {
        this.formGroup.controls.private.setValue(this.chargingStation.private);
      }
      if (this.chargingStation.issuer) {
        this.formGroup.controls.issuer.setValue(this.chargingStation.issuer);
      }
      if (this.chargingStation.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.chargingStation.maximumPower);
      }
      if (this.chargingStation.coordinates) {
        this.longitude.setValue(this.chargingStation.coordinates[0]);
        this.latitude.setValue(this.chargingStation.coordinates[1]);
      }
      if (this.chargingStation.siteAreaID) {
        this.formGroup.controls.siteAreaID.setValue(this.chargingStation.siteArea.id);
      }
      if (this.chargingStation.siteArea) {
        this.formGroup.controls.siteArea.setValue(this.chargingStation.siteArea.name);
      }
      if (!this.chargingStation.issuer) {
        this.formGroup.disable();
      }
      // URL not editable in case OCPP v1.6 or above
      if (this.chargingStation.ocppProtocol === OCPPProtocol.JSON) {
        this.chargingStationURL.disable();
      }
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
  }

  public connectorPowerChanged() {
    let totalPower = 0;
    for (const connectorControl of this.connectors.controls) {
      if (connectorControl.get('power').value as number > 0) {
        totalPower += connectorControl.get('power').value as number;
      }
    }
    this.maximumPower.setValue(totalPower);
  }

  public saveChargingStation() {
    this.spinnerService.show();
    this.centralServerService.updateChargingStationParams(
        this.formGroup.getRawValue() as ChargingStation).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          this.translateService.instant('chargers.change_config_success',
            { chargeBoxID: this.chargingStation.id }));
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['change_config_error']);
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPAuthError.ERROR:
          this.messageService.showErrorMessage(
            this.translateService.instant('chargers.change_config_error'));
          break;
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage(this.messages['change_config_error']);
          break;
        case HTTPError.THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA:
            this.messageService.showErrorMessage(this.messages['chargers.change_config_phase_error']);
            break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, this.messages['change_config_error']);
      }
    });
  }

  public assignSiteArea() {
    if (!this.chargingStation.issuer) {
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
    this.dialog.open(SiteAreasDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (result && result.length > 0 && result[0] && result[0].objectRef) {
        this.chargingStation.siteArea = ((result[0].objectRef) as SiteArea);
        this.siteArea.setValue(this.chargingStation.siteArea.name);
        this.siteAreaID.setValue(this.chargingStation.siteArea.id);
        this.formGroup.markAsDirty();
      }
    });
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Get latitud/longitude from form
    let latitude = this.latitude.value;
    let longitude = this.longitude.value;
    // If one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      const siteArea = this.chargingStation.siteArea;
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
        { componentName: 'Charging Station', itemComponentName: this.chargingStation.id }),
      latitude,
      longitude,
      label: this.chargingStation.id ? this.chargingStation.id : '',
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
          this.saveChargingStation();
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }
}
