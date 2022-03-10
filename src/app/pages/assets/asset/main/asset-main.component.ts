import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { ConfigService } from '../../../../services/config.service';
import { MessageService } from '../../../../services/message.service';
import { GeoMapDialogComponent } from '../../../../shared/dialogs/geomap/geomap-dialog.component';
import { SiteAreasDialogComponent } from '../../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { Asset, AssetTypes } from '../../../../types/Asset';
import { KeyValue } from '../../../../types/GlobalType';
import { SiteArea } from '../../../../types/SiteArea';
import { TenantComponents } from '../../../../types/Tenant';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-asset-main',
  templateUrl: 'asset-main.component.html',
})
export class AssetMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public currentAssetID!: string;
  @Input() public asset!: Asset;
  @Input() public readOnly: boolean;

  public image: string = Constants.NO_IMAGE;
  public imageChanged = false;
  public maxSize: number;
  public isSmartChargingComponentActive = false;

  public selectedSiteArea: SiteArea;
  public assetTypes!: KeyValue[];

  public id!: AbstractControl;
  public name!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public assetType!: AbstractControl;
  public excludeFromSmartCharging!: AbstractControl;
  public variationThresholdPercent!: AbstractControl;
  public fluctuationPercent!: AbstractControl;
  public staticValueWatt!: AbstractControl;
  public coordinates!: FormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {
    this.maxSize = this.configService.getAsset().maxImageKb;
    this.assetTypes = AssetTypes;
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl('name', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(255),
      ])
    ));
    this.formGroup.addControl('siteArea', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('siteAreaID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('assetType', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('excludeFromSmartCharging', new FormControl(false));
    this.formGroup.addControl('variationThresholdPercent', new FormControl(null,
      Validators.compose([
        Validators.max(100),
        Validators.pattern('^[+]?[0-9]*$'),
      ])
    ));
    this.formGroup.addControl('fluctuationPercent', new FormControl(null,
      Validators.compose([
        Validators.max(100),
        Validators.pattern('^[+]?[0-9]*$'),
      ])
    ));
    this.formGroup.addControl('staticValueWatt', new FormControl(null,
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('coordinates', new FormArray([
      new FormControl(null,
        Validators.compose([
          Validators.max(180),
          Validators.min(-180),
          Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
        ])),
      new FormControl(null,
        Validators.compose([
          Validators.max(90),
          Validators.min(-90),
          Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
        ])),
    ]));
    this.formGroup.addControl('connectionID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.assetType = this.formGroup.controls['assetType'];
    this.excludeFromSmartCharging = this.formGroup.controls['excludeFromSmartCharging'];
    this.variationThresholdPercent = this.formGroup.controls['variationThresholdPercent'];
    this.fluctuationPercent = this.formGroup.controls['fluctuationPercent'];
    this.staticValueWatt = this.formGroup.controls['staticValueWatt'];
    this.coordinates = this.formGroup.controls['coordinates'] as FormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    if (this.readOnly) {
      this.formGroup.disable();
    }
  }

  public ngOnChanges() {
    this.loadAsset();
  }

  public loadAsset() {
    // ID not provided we are in creation mode
    if (this.asset) {
      if (this.asset.id) {
        this.formGroup.controls.id.setValue(this.asset.id);
      }
      if (this.asset.name) {
        this.formGroup.controls.name.setValue(this.asset.name);
      }
      if (this.asset.siteArea && this.asset.siteArea.name) {
        this.formGroup.controls.siteAreaID.setValue(this.asset.siteArea.id);
        this.formGroup.controls.siteArea.setValue(this.asset.siteArea.name);
        this.selectedSiteArea = this.asset.siteArea;
      }
      if (this.asset.assetType) {
        this.formGroup.controls.assetType.setValue(this.asset.assetType);
      }
      if (this.asset.excludeFromSmartCharging) {
        this.formGroup.controls.excludeFromSmartCharging.setValue(this.asset.excludeFromSmartCharging);
      }
      if (this.asset.variationThresholdPercent) {
        this.formGroup.controls.variationThresholdPercent.setValue(this.asset.variationThresholdPercent);
      }
      if (this.asset.fluctuationPercent) {
        this.formGroup.controls.fluctuationPercent.setValue(this.asset.fluctuationPercent);
      }
      if (!Utils.isUndefined(this.asset.staticValueWatt)) {
        this.formGroup.controls.staticValueWatt.setValue(this.asset.staticValueWatt);
      }
      if (this.asset.coordinates) {
        this.longitude.setValue(this.asset.coordinates[0]);
        this.latitude.setValue(this.asset.coordinates[1]);
      }
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
      // Get Asset image
      if (!this.imageChanged) {
        this.centralServerService.getAssetImage(this.currentAssetID).subscribe((assetImage) => {
          this.imageChanged = true;
          if (assetImage) {
            this.image = assetImage;
          }
        });
      }
    }
  }

  public updateAssetImage(asset: Asset) {
    if (this.image !== Constants.NO_IMAGE) {
      asset.image = this.image;
    } else {
      asset.image = null;
    }
  }

  public updateAssetCoordinates(asset: Asset) {
    if (asset.coordinates &&
      !(asset.coordinates[0] || asset.coordinates[1])) {
      delete asset.coordinates;
    }
  }

  public onImageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('assets.logo_size_error', { maxPictureKb: this.maxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.imageChanged = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearImage() {
    this.image = Constants.NO_IMAGE;
    this.imageChanged = true;
    this.formGroup.markAsDirty();
  }

  public assignSiteArea() {
    // Create dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'chargers.assign_site_area',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true
      },
    };
    this.dialog.open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const siteArea = ((result[0].objectRef) as SiteArea);
          this.formGroup.markAsDirty();
          this.formGroup.controls.siteArea.setValue(siteArea.name);
          this.formGroup.controls.siteAreaID.setValue(siteArea.id);
          this.selectedSiteArea = siteArea;
        }
      });
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Get latitude/longitude from form
    let latitude = this.latitude.value;
    let longitude = this.longitude.value;
    // If one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      if (this.selectedSiteArea && this.selectedSiteArea.address) {
        if (this.selectedSiteArea.address.coordinates && this.selectedSiteArea.address.coordinates.length === 2) {
          latitude = this.selectedSiteArea.address.coordinates[1];
          longitude = this.selectedSiteArea.address.coordinates[0];
        } else {
          const site = this.selectedSiteArea.site;
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
        { componentName: 'Asset', itemComponentName: this.name.value ? this.name.value : 'Asset' }),
      latitude,
      longitude,
      label: this.name.value ? this.name.value : 'Asset',
    };
    // Disable outside click close
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
}
