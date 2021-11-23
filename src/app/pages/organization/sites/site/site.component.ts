import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ComponentService } from 'services/component.service';
import { DialogMode } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { ConfigService } from '../../../../services/config.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { CompaniesDialogComponent } from '../../../../shared/dialogs/companies/companies-dialog.component';
import { Address } from '../../../../types/Address';
import { Company } from '../../../../types/Company';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { Site } from '../../../../types/Site';
import { TenantComponents } from '../../../../types/Tenant';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-site',
  templateUrl: 'site.component.html',
})
export class SiteComponent implements OnInit {
  @Input() public currentSiteID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;

  public image = Constants.NO_IMAGE;
  public imageHasChanged = false;
  public maxSize: number;
  public readOnly = true;
  public OCPIActive: boolean;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public company!: AbstractControl;
  public companyID!: AbstractControl;
  public tariffID: AbstractControl;
  public autoUserSiteAssignment!: AbstractControl;
  public public!: AbstractControl;

  public address!: Address;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {
    this.maxSize = this.configService.getSite().maxPictureKb;
    this.OCPIActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(255),
        ])),
      company: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      companyID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      autoUserSiteAssignment: new FormControl(false),
      public: new FormControl(false),
      tariffID: new FormControl('',
        Validators.compose([
          Validators.maxLength(50),
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.company = this.formGroup.controls['company'];
    this.companyID = this.formGroup.controls['companyID'];
    this.tariffID = this.formGroup.controls['tariffID'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.public = this.formGroup.controls['public'];
    // Set
    this.readOnly = (this.dialogMode === DialogMode.VIEW);
    // Load Site
    this.loadSite();
    // Handle Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadSite() {
    if (this.currentSiteID) {
      this.spinnerService.show();
      this.centralServerService.getSite(this.currentSiteID, false, true).subscribe((site) => {
        this.spinnerService.hide();
        // Init form
        if (site.id) {
          this.formGroup.controls.id.setValue(site.id);
        }
        if (site.name) {
          this.formGroup.controls.name.setValue(site.name);
        }
        if (site.companyID) {
          this.formGroup.controls.companyID.setValue(site.companyID);
        }
        if (site.company) {
          this.formGroup.controls.company.setValue(site.company.name);
        }
        if (site.tariffID) {
          this.formGroup.controls.tariffID.setValue(site.tariffID);
        }
        if (site.autoUserSiteAssignment) {
          this.formGroup.controls.autoUserSiteAssignment.setValue(site.autoUserSiteAssignment);
        } else {
          this.formGroup.controls.autoUserSiteAssignment.setValue(false);
        }
        if (site.public) {
          this.formGroup.controls.public.setValue(site.public);
        } else {
          this.formGroup.controls.public.setValue(false);
        }
        if (site.address) {
          this.address = site.address;
        }
        if (site.metadata?.autoUserSiteAssignment && !site.metadata?.autoUserSiteAssignment.enabled) {
          this.formGroup.controls.autoUserSiteAssignment.disable();
        }
        // Update form group
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
        // Get Site image
        this.centralServerService.getSiteImage(this.currentSiteID).subscribe((siteImage) => {
          this.image = siteImage ? siteImage : Constants.NO_IMAGE;
        });
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('sites.site_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      });
    }
  }

  public refresh() {
    this.loadSite();
  }

  public assignCompany() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'sites.assign_company',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true
      }
    };
    // Open
    this.dialog.open(CompaniesDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const company: Company = (result[0].objectRef) as Company;
        this.company.setValue(company.name);
        this.companyID.setValue(company.id);
        this.formGroup.markAsDirty();
      }
    });
  }

  public updateSiteImage(site: Site) {
    if (this.imageHasChanged) {
      // Set new image
      if (this.image !== Constants.NO_IMAGE) {
        site.image = this.image;
      } else {
        site.image = null;
      }
    } else {
      // No changes
      delete site.image;
    }
  }

  public updateSiteCoordinates(site: Site) {
    if (site.address && site.address.coordinates &&
      !(site.address.coordinates[0] || site.address.coordinates[1])) {
      delete site.address.coordinates;
    }
  }

  public saveSite(site: Site) {
    if (this.currentSiteID) {
      this.updateSite(site);
    } else {
      this.createSite(site);
    }
  }

  public onImageChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('sites.image_size_error', { maxPictureKb: this.maxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.imageHasChanged = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearImage() {
    // Clear
    this.image = Constants.NO_IMAGE;
    this.imageHasChanged = true;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveSite.bind(this), this.closeDialog.bind(this));
  }

  private createSite(site: Site) {
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Set coordinates
    this.updateSiteCoordinates(site);
    // Create
    this.centralServerService.createSite(site).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('sites.create_success',
          { siteName: site.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'sites.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('sites.site_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.create_error');
      }
    });
  }

  private updateSite(site: Site) {
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Set coordinates
    this.updateSiteCoordinates(site);
    // Update
    this.centralServerService.updateSite(site).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('sites.update_success', { siteName: site.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'sites.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('sites.site_not_found');
          break;
        case HTTPError.FEATURE_NOT_SUPPORTED_ERROR:
          this.messageService.showErrorMessage('sites.update_public_site_error', { siteName: site.name });
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'sites.update_error');
      }
    });
  }
}
