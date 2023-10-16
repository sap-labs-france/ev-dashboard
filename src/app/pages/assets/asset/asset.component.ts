import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { AssetsAuthorizations, DialogMode } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Asset } from '../../../types/Asset';
import { RestResponse } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { AssetMainComponent } from './main/asset-main.component';

@Component({
  selector: 'app-asset',
  templateUrl: 'asset.component.html',
  styleUrls: ['asset.component.scss'],
})
export class AssetComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentAssetID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public assetsAuthorizations!: AssetsAuthorizations;

  @ViewChild('assetMainComponent') public assetMainComponent!: AssetMainComponent;

  public formGroup!: UntypedFormGroup;
  public readOnly = true;
  public asset!: Asset;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService,
    private router: Router
  ) {
    super(activatedRoute, windowService, ['main', 'connection'], false);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Load Asset
    this.loadAsset();
  }

  public loadAsset() {
    if (this.currentAssetID) {
      this.spinnerService.show();
      this.centralServerService.getAsset(this.currentAssetID, false, true).subscribe({
        next: (asset) => {
          this.spinnerService.hide();
          this.asset = asset;
          if (this.readOnly) {
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
              this.messageService.showErrorMessage('assets.asset_not_found');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'general.unexpected_error_backend'
              );
          }
        },
      });
    }
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
      this.saveAsset.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveAsset(asset: Asset) {
    if (this.currentAssetID) {
      this.updateAsset(asset);
    } else {
      this.createAsset(asset);
    }
  }

  private createAsset(asset: Asset) {
    this.spinnerService.show();
    // Set coordinates
    this.assetMainComponent.updateAssetCoordinates(asset);
    // Set the image
    this.assetMainComponent.updateAssetImage(asset);
    // Create
    this.centralServerService.createAsset(asset).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('assets.create_success', {
            assetName: asset.name,
          });
          this.currentAssetID = asset.id;
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'assets.create_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('assets.asset_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'assets.create_error'
            );
        }
      },
    });
  }

  private updateAsset(asset: Asset) {
    this.spinnerService.show();
    // Set coordinates
    this.assetMainComponent.updateAssetCoordinates(asset);
    // Set the image
    this.assetMainComponent.updateAssetImage(asset);
    // Update
    this.centralServerService.updateAsset(asset).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('assets.update_success', {
            assetName: asset.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'assets.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('assets.asset_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'assets.update_error'
            );
        }
      },
    });
  }
}
