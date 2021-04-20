import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-site',
  templateUrl: 'site.component.html',
})
export class SiteComponent implements OnInit {
  @Input() public site!: Site;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public image = Constants.NO_IMAGE;
  public imageHasChanged = false;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public company!: AbstractControl;
  public companyID!: AbstractControl;
  public autoUserSiteAssignment!: AbstractControl;
  public public!: AbstractControl;

  public address!: Address;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {
    this.maxSize = this.configService.getSite().maxPictureKb;
    // Check auth
    if (this.activatedRoute.snapshot.params['id']) {
      // Not authorized
      this.router.navigate(['/']);
    }
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
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
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.company = this.formGroup.controls['company'];
    this.companyID = this.formGroup.controls['companyID'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.public = this.formGroup.controls['public'];
    if (this.site.id) {
      this.loadSite();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.site.id = params['id'];
        // this.loadSite();
      });
    }
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setSite(site: Site) {
    this.site = site;
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

  public refresh() {
    this.loadSite();
  }

  public loadSite() {
    if (!this.site.id) {
      return;
    }

    // Init form
    if (this.site.id) {
      this.formGroup.controls.id.setValue(this.site.id);
    }
    if (this.site.name) {
      this.formGroup.controls.name.setValue(this.site.name);
    }
    if (this.site.companyID) {
      this.formGroup.controls.companyID.setValue(this.site.companyID);
    }
    if (this.site.company) {
      this.formGroup.controls.company.setValue(this.site.company.name);
    }
    if (this.site.autoUserSiteAssignment) {
      this.formGroup.controls.autoUserSiteAssignment.setValue(this.site.autoUserSiteAssignment);
    } else {
      this.formGroup.controls.autoUserSiteAssignment.setValue(false);
    }
    if (this.site.public) {
      this.formGroup.controls.public.setValue(this.site.public);
    } else {
      this.formGroup.controls.public.setValue(false);
    }
    if (this.site.address) {
      this.address = this.site.address;
    }
    // Cannot change roaming Site
    if (!this.site.issuer) {
      this.formGroup.disable();
    } else {
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
    // Get Site image
    this.centralServerService.getSiteImage(this.site.id).subscribe((siteImage) => {
      this.image = siteImage ? siteImage : Constants.NO_IMAGE;
    });
    if (!this.site.canUpdate) {
      this.formGroup.disable();
    }
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
    if (this.site.id) {
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
    if (this.inDialog) {
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
        this.site.id = site.id;
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
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'sites.update_error');
      }
    });
  }
}
