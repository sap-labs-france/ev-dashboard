import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { GeoMapDialogComponent } from 'app/shared/dialogs/geomap/geomap-dialog.component';
import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { Asset, AssetImage, AssetTypes } from 'app/types/Asset';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { Utils } from 'app/utils/Utils';
import { debounceTime, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-asset',
  templateUrl: 'asset.component.html',
})
export class AssetComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() public currentAssetID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public isAdmin = false;
  public image: string = AssetImage.NO_IMAGE;
  public maxSize: number;
  public selectedSiteArea: SiteArea;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public assetType!: AbstractControl;
  public coordinates!: FormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;
  public assetTypes!: KeyValue[];
  public asset!: Asset;

  constructor(
      private authorizationService: AuthorizationService,
      private centralServerService: CentralServerService,
      private centralServerNotificationService: CentralServerNotificationService,
      private messageService: MessageService,
      private spinnerService: SpinnerService,
      private configService: ConfigService,
      private activatedRoute: ActivatedRoute,
      private dialog: MatDialog,
      private dialogService: DialogService,
      private translateService: TranslateService,
      private router: Router) {
    this.maxSize = this.configService.getAsset().maxImageKb;
    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateAsset()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get asset types
    this.assetTypes = AssetTypes;
    // Get admin flag
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      siteArea: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      siteAreaID: new FormControl(''),
      assetType: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
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
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.assetType = this.formGroup.controls['assetType'];
    this.coordinates = this.formGroup.controls['coordinates'] as FormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    // if not admin switch in readonly mode
    if (!this.isAdmin) {
      this.formGroup.disable();
    }
    if (this.currentAssetID) {
      this.loadAsset();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentAssetID = params['id'];
        this.loadAsset();
      });
    }
    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentAssetId(currentAssetId: string) {
    this.currentAssetID = currentAssetId;
  }

  public refresh() {
    // Load Asset
    this.loadAsset();
  }

  public loadAsset() {
    if (!this.currentAssetID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getAsset(this.currentAssetID, false, true).pipe(mergeMap((asset) => {
      this.asset = asset;
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
      if (this.asset.coordinates) {
        this.longitude.setValue(this.asset.coordinates[0]);
        this.latitude.setValue(this.asset.coordinates[1]);
      }
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
      // Yes, get image
      return this.centralServerService.getAssetImage(this.currentAssetID);
    })).subscribe((assetImage) => {
      if (assetImage && assetImage.image) {
        this.image = assetImage.image.toString();
      }
      this.spinnerService.hide();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('assets.asset_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public updateAssetImage(asset: Asset) {
    // Check no asset?
    if (!this.image.endsWith(AssetImage.NO_IMAGE)) {
      // Set to asset
      asset.image = this.image;
    } else {
      // No image
      delete asset.image;
    }
  }

  public updateAssetCoordinates(asset: Asset) {
    if (asset.coordinates && !(asset.coordinates[0] || asset.coordinates[1])) {
      delete asset.coordinates;
    }
  }

  public saveAsset(asset: Asset) {
    if (this.currentAssetID) {
      this.updateAsset(asset);
    } else {
      this.createAsset(asset);
    }
  }

  public imageChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('assets.logo_size_error', {maxPictureKb: this.maxSize});
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearImage() {
    // Clear
    this.image = AssetImage.NO_IMAGE;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
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
          this.saveAsset(this.formGroup.value);
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
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
    };
    this.dialog.open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
        if (result && result.length > 0 && result[0].objectRef) {
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

  private createAsset(asset: Asset) {
    this.spinnerService.show();
    // Set coordinates
    this.updateAssetCoordinates(asset);
    // Set the image
    this.updateAssetImage(asset);
    // Create
    this.centralServerService.createAsset(asset).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('assets.create_success',
          { assetName: asset.name });
        this.currentAssetID = asset.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'assets.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('assets.asset_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'assets.create_error');
      }
    });
  }

  private updateAsset(asset: Asset) {
    this.spinnerService.show();
    // Set coordinates
    this.updateAssetCoordinates(asset);
    // Set the image
    this.updateAssetImage(asset);
    // Update
    this.centralServerService.updateAsset(asset).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('assets.update_success', { assetName: asset.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'assets.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('assets.asset_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'assets.update_error');
      }
    });
  }
}
