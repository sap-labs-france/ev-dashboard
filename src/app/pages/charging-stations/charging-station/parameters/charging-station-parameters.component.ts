import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ChargingStationsAuthorizations } from 'types/Authorization';
import { GeoMapDialogData, GeoMapDialogResult } from 'types/Dialog';

import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { LocaleService } from '../../../../services/locale.service';
import { GeoMapDialogComponent } from '../../../../shared/dialogs/geomap/geomap-dialog.component';
import { SiteAreasDialogComponent } from '../../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { ChargingStation, OCPPProtocol } from '../../../../types/ChargingStation';
import { ButtonAction, KeyValue } from '../../../../types/GlobalType';
import { SiteArea } from '../../../../types/SiteArea';
import { TenantComponents } from '../../../../types/Tenant';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-parameters',
  templateUrl: 'charging-station-parameters.component.html',
})
// @Injectable()
export class ChargingStationParametersComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public formGroup: UntypedFormGroup;
  @Input() public readOnly: boolean;
  @Input() public chargingStationsAuthorizations: ChargingStationsAuthorizations;

  public userLocales: KeyValue[];
  public ocpiActive: boolean;
  public isSmartChargingComponentActive = false;

  public id!: AbstractControl;
  public chargingStationURL!: AbstractControl;
  public public!: AbstractControl;
  public excludeFromSmartCharging: AbstractControl;
  public forceInactive: AbstractControl;
  public manualConfiguration: AbstractControl;
  public issuer!: AbstractControl;
  public masterSlave!: AbstractControl;
  public maximumPower!: AbstractControl;
  public maximumPowerAmps!: AbstractControl;
  public coordinates!: UntypedFormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public connectors!: UntypedFormArray;
  public chargePoints!: UntypedFormArray;
  public tariffID: AbstractControl;
  public isOrganizationComponentActive: boolean;

  private initialized: boolean;

  public constructor(
    private componentService: ComponentService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    this.initialized = false;
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
    this.isSmartChargingComponentActive = this.componentService.isActive(
      TenantComponents.SMART_CHARGING
    );
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('id', new UntypedFormControl());
    this.formGroup.addControl(
      'chargingStationURL',
      new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      )
    );
    this.formGroup.addControl('public', new UntypedFormControl(false));
    this.formGroup.addControl('issuer', new UntypedFormControl(false));
    this.formGroup.addControl('forceInactive', new UntypedFormControl(false));
    this.formGroup.addControl('manualConfiguration', new UntypedFormControl(false));
    this.formGroup.addControl('masterSlave', new UntypedFormControl(false));
    this.formGroup.addControl(
      'maximumPower',
      new UntypedFormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      )
    );
    this.formGroup.addControl(
      'maximumPowerAmps',
      new UntypedFormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      )
    );
    this.formGroup.addControl(
      'siteArea',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'siteAreaID',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('connectors', new UntypedFormArray([]));
    this.formGroup.addControl('chargePoints', new UntypedFormArray([]));
    this.formGroup.addControl(
      'coordinates',
      new UntypedFormArray([
        new UntypedFormControl(
          '',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
          ])
        ),
        new UntypedFormControl(
          '',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
          ])
        ),
      ])
    );
    this.formGroup.addControl(
      'tariffID',
      new UntypedFormControl(null, Validators.compose([Validators.maxLength(36)]))
    );
    this.formGroup.addControl('excludeFromSmartCharging', new UntypedFormControl(false));
    // Form
    this.id = this.formGroup.controls['id'];
    this.chargingStationURL = this.formGroup.controls['chargingStationURL'];
    this.public = this.formGroup.controls['public'];
    this.issuer = this.formGroup.controls['issuer'];
    this.excludeFromSmartCharging = this.formGroup.controls['excludeFromSmartCharging'];
    this.forceInactive = this.formGroup.controls['forceInactive'];
    this.manualConfiguration = this.formGroup.controls['manualConfiguration'];
    this.masterSlave = this.formGroup.controls['masterSlave'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.maximumPowerAmps = this.formGroup.controls['maximumPowerAmps'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.coordinates = this.formGroup.controls['coordinates'] as UntypedFormArray;
    this.connectors = this.formGroup.controls['connectors'] as UntypedFormArray;
    this.chargePoints = this.formGroup.controls['chargePoints'] as UntypedFormArray;
    this.tariffID = this.formGroup.controls['tariffID'];
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    this.maximumPowerAmps.disable();
    this.masterSlave.disable();
    // Form initialized
    this.initialized = true;
    this.loadChargingStation();
  }

  public ngOnChanges() {
    this.loadChargingStation();
  }

  // eslint-disable-next-line complexity
  public loadChargingStation() {
    if (this.initialized && this.chargingStation) {
      // Init form with values
      this.id.setValue(this.chargingStation.id);
      this.issuer.setValue(this.chargingStation.issuer);
      this.forceInactive.setValue(this.chargingStation.forceInactive);
      this.manualConfiguration.setValue(this.chargingStation.manualConfiguration);
      this.masterSlave.setValue(this.chargingStation.masterSlave);
      this.chargingStationURL.setValue(this.chargingStation.chargingStationURL);
      this.public.setValue(this.chargingStation.public);
      this.tariffID.setValue(this.chargingStation.tariffID);
      this.maximumPower.setValue(this.chargingStation.maximumPower);
      this.maximumPowerAmps.setValue(Utils.computeChargingStationTotalAmps(this.chargingStation));
      if (!this.chargingStation.site.public) {
        this.public.disable();
      }
      if (!this.chargingStation.capabilities?.supportChargingProfiles) {
        this.excludeFromSmartCharging.setValue(true);
        this.excludeFromSmartCharging.disable();
      } else {
        this.excludeFromSmartCharging.setValue(this.chargingStation.excludeFromSmartCharging);
      }
      if (Utils.containsGPSCoordinates(this.chargingStation.coordinates)) {
        this.longitude.setValue(this.chargingStation.coordinates[0]);
        this.latitude.setValue(this.chargingStation.coordinates[1]);
      }
      this.siteAreaID.setValue(this.chargingStation.siteAreaID);
      if (this.chargingStation.siteArea) {
        this.siteArea.setValue(this.chargingStation.siteArea.name);
      }
      // URL not editable in case OCPP v1.6 or above
      if (this.chargingStation.ocppProtocol === OCPPProtocol.JSON) {
        this.chargingStationURL.disable();
      }
      if (this.chargingStation.chargePoints && !this.manualConfiguration.value) {
        this.maximumPower.disable();
      }
    }
  }

  public connectorChanged() {
    if (Utils.isEmptyArray(this.chargingStation.chargePoints)) {
      let totalPower = 0;
      for (const connectorControl of this.connectors.controls) {
        if ((connectorControl.get('power').value as number) > 0) {
          totalPower += connectorControl.get('power').value as number;
        }
      }
      this.maximumPower.setValue(totalPower);
      this.maximumPowerAmps.setValue(
        Utils.convertWattToAmp(this.formGroup.getRawValue() as ChargingStation, null, 0, totalPower)
      );
    }
  }

  public chargePointChanged() {
    if (this.manualConfiguration.value && this.formGroup.dirty) {
      const currentChargingStation = Utils.cloneObject(
        this.formGroup.getRawValue()
      ) as ChargingStation;
      delete currentChargingStation.maximumPower;
      Utils.adjustChargePoints(currentChargingStation);
      const totalPower = Utils.getChargingStationPower(currentChargingStation);
      this.maximumPower.setValue(totalPower);
      this.maximumPowerAmps.setValue(
        Utils.convertWattToAmp(currentChargingStation, null, 0, totalPower)
      );
    }
  }

  public maximumPowerChanged() {
    if (!this.maximumPower.errors) {
      this.maximumPowerAmps.setValue(
        Utils.convertWattToAmp(
          this.formGroup.getRawValue() as ChargingStation,
          null,
          0,
          this.maximumPower.value as number
        )
      );
    }
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
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
      },
    };
    // Open
    this.dialog
      .open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const siteArea = result[0].objectRef as SiteArea;
          this.chargingStation.siteArea = siteArea;
          this.chargingStation.site = siteArea.site;
          this.siteArea.setValue(siteArea.name);
          this.siteAreaID.setValue(siteArea.id);
          this.formGroup.markAsDirty();
        }
      });
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig<GeoMapDialogData>();
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
          if (
            site &&
            site.address &&
            site.address.coordinates &&
            site.address.coordinates.length === 2
          ) {
            latitude = site.address.coordinates[1];
            longitude = site.address.coordinates[0];
          }
        }
      }
    }
    // Set data
    dialogConfig.data = {
      dialogTitle: this.translateService.instant('geomap.dialog_geolocation_title', {
        componentName: 'Charging Station',
        itemComponentName: this.chargingStation.id,
      }),
      latitude,
      longitude,
      label: this.chargingStation.id ? this.chargingStation.id : '',
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog
      .open<GeoMapDialogComponent, GeoMapDialogData, GeoMapDialogResult>(
      GeoMapDialogComponent,
      dialogConfig
    )
      .afterClosed()
      .subscribe((result) => {
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

  public manualConfigurationChanged(checked: boolean) {
    if (!Utils.isEmptyArray(this.chargingStation.chargePoints) && checked) {
      // Show yes/no dialog
      this.dialogService
        .createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.enable_manual_configuration.title'),
          this.translateService.instant('chargers.dialog.enable_manual_configuration.confirm')
        )
        .subscribe((result) => {
          if (result === ButtonAction.NO) {
            this.manualConfiguration.setValue(false);
            // Reload initial charging station to restore e.g. maximum power, when it was changed by the adjustment methods
            this.loadChargingStation();
          } else {
            // Make maximum power of charging station configurable, when manual config is enabled (Rules can not really be applied here)
            this.maximumPower.enable();
          }
        });
    } else if (!checked) {
      this.dialogService
        .createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.disable_manual_configuration.title'),
          this.translateService.instant('chargers.dialog.disable_manual_configuration.confirm')
        )
        .subscribe((result) => {
          if (result === ButtonAction.NO) {
            this.manualConfiguration.setValue(true);
          } else {
            this.maximumPower.disable();
            // Check initial charging station
            if (!this.chargingStation.manualConfiguration) {
              if (Utils.isEmptyArray(this.chargingStation.chargePoints)) {
                this.dialogService.createAndShowOkDialog(
                  this.translateService.instant('chargers.dialog.manual_configuration_error.title'),
                  this.translateService.instant(
                    'chargers.dialog.manual_configuration_error.confirm'
                  )
                );
              } else {
                // Reload initial charging station to restore e.g. maximum power, when it was changed by the adjustment methods
                this.loadChargingStation();
              }
            }
          }
        });
    }
  }

  public emptyStringToNull(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
  }
}
