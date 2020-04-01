import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { Address } from 'app/types/Address';
import { Asset, AssetImage } from 'app/types/Asset';
import { RestResponse } from 'app/types/GlobalType';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType } from 'app/types/Table';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { Utils } from 'app/utils/Utils';
import { debounceTime, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-asset',
  templateUrl: 'asset.component.html',
})
export class AssetComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentAssetID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;

  public isAdmin = false;
  public image: string = AssetImage.NO_IMAGE;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public address!: Address;

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

    // Get admin flag
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
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
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];

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

    this.centralServerNotificationService.getSubjectAsset().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.currentAssetID) {
        this.loadAsset();
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
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    // tslint:disable-next-line: cyclomatic-complexity
    this.centralServerService.getAsset(this.currentAssetID, false, true).pipe(mergeMap((asset) => {
      // Init form
      if (asset.id) {
        this.formGroup.controls.id.setValue(asset.id);
      }
      if (asset.name) {
        this.formGroup.controls.name.setValue(asset.name);
      }
      if (asset.siteArea && asset.siteArea.name) {
        this.formGroup.controls.siteAreaID.setValue(asset.siteArea.id);
        this.formGroup.controls.siteArea.setValue(asset.siteArea.name);
      }
      if (asset.address) {
        this.address = asset.address;
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
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'assets.asset_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
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
    if (asset.address && asset.address.coordinates &&
      !(asset.address.coordinates[0] || asset.address.coordinates[1])) {
      delete asset.address.coordinates;
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
      }
    });
  }

  private createAsset(asset: Asset) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateAssetImage(asset);
    // Set coordinates
    this.updateAssetCoordinates(asset);
    // Yes: Update
    this.centralServerService.createAsset(asset).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('assets.create_success',
          { assetName: asset.name });
        // Refresh
        this.currentAssetID = asset.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'assets.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Asset deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('assets.asset_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'assets.create_error');
      }
    });
  }

  private updateAsset(asset: Asset) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateAssetImage(asset);
    // Set coordinates
    this.updateAssetCoordinates(asset);
    // Yes: Update
    this.centralServerService.updateAsset(asset).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('assets.update_success', { assetName: asset.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'assets.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Asset deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('assets.asset_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'assets.update_error');
      }
    });
  }
}
