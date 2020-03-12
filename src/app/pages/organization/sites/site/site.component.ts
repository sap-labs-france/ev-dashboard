import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Action, Entity } from 'app/types/Authorization';
import { RestResponse } from 'app/types/GlobalType';
import { Site, SiteImage } from 'app/types/Site';
import { ButtonType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';

@Component({
  selector: 'app-site',
  templateUrl: 'site.component.html',
})
export class SiteComponent implements OnInit {
  @Input() currentSiteID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;

  public image: any = SiteImage.NO_IMAGE;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public companyID!: AbstractControl;
  public autoUserSiteAssignment!: AbstractControl;

  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: FormArray;
  public companies: any;
  public isAdmin = false;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
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
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateSite()) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // refresh comapnies
    this.refreshAvailableCompanies();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      companyID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      autoUserSiteAssignment: new FormControl(false),
      address: new FormGroup({
        address1: new FormControl(''),
        address2: new FormControl(''),
        postalCode: new FormControl(''),
        city: new FormControl(''),
        department: new FormControl(''),
        region: new FormControl(''),
        country: new FormControl(''),
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
      }),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.companyID = this.formGroup.controls['companyID'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;

    this.isAdmin = this.authorizationService.canAccess(Entity.SITE, Action.CREATE);

    if (this.currentSiteID) {
      this.loadSite();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteID = params['id'];
        // this.loadSite();
      });
    }

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });

    this.centralServerNotificationService.getSubjectSite().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.currentSiteID) {
        this.loadSite();
      }
    });
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentSiteId(currentSiteID: string) {
    this.currentSiteID = currentSiteID;
  }

  public refresh() {
    // Load Site
    this.loadSite();
  }

  public refreshAvailableCompanies() {
    this.centralServerService.getCompanies({}).subscribe((availableCompanies) => {
      // clear current entries
      this.companies = [];

      // add available companies to dropdown
      for (let i = 0; i < availableCompanies.count; i++) {
        this.companies.push({
          id: availableCompanies.result[i].id,
          name: availableCompanies.result[i].name,
        });
      }
    });
  }

  public loadSite() {
    // refresh available companies
    this.refreshAvailableCompanies();

    if (!this.currentSiteID) {
      return;
    }

    this.isAdmin = this.authorizationService.isSiteAdmin(this.currentSiteID) || this.authorizationService.isSiteOwner(this.currentSiteID);

    // if not admin switch in readonly mode
    if (!this.isAdmin) {
      this.formGroup.disable();
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    // tslint:disable-next-line:cyclomatic-complexity
    this.centralServerService.getSite(this.currentSiteID).pipe(mergeMap((site) => {
      this.formGroup.markAsPristine();
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
      if (site.autoUserSiteAssignment) {
        this.formGroup.controls.autoUserSiteAssignment.setValue(site.autoUserSiteAssignment);
      } else {
        this.formGroup.controls.autoUserSiteAssignment.setValue(false);
      }
      if (site.address && site.address.address1) {
        this.address.controls.address1.setValue(site.address.address1);
      }
      if (site.address && site.address.address2) {
        this.address.controls.address2.setValue(site.address.address2);
      }
      if (site.address && site.address.postalCode) {
        this.address.controls.postalCode.setValue(site.address.postalCode);
      }
      if (site.address && site.address.city) {
        this.address.controls.city.setValue(site.address.city);
      }
      if (site.address && site.address.department) {
        this.address.controls.department.setValue(site.address.department);
      }
      if (site.address && site.address.region) {
        this.address.controls.region.setValue(site.address.region);
      }
      if (site.address && site.address.country) {
        this.address.controls.country.setValue(site.address.country);
      }
      if (site.address && site.address.coordinates && site.address.coordinates.length === 2) {
        this.coordinates.at(0).setValue(site.address.coordinates[0]);
        this.coordinates.at(1).setValue(site.address.coordinates[1]);
      }
      // Yes, get image
      return this.centralServerService.getSiteImage(this.currentSiteID);
    })).subscribe((siteImage) => {
      if (siteImage && siteImage.image) {
        this.image = siteImage.image.toString();
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.site_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateSiteImage(site: Site) {
    // Check no image?
    if (!this.image.endsWith(SiteImage.NO_IMAGE)) {
      // Set to site
      site.image = this.image;
    } else {
      // No image
      delete site.image;
    }
  }

  public saveSite(site: Site) {
    if (this.currentSiteID) {
      this.updateSite(site);
    } else {
      this.createSite(site);
    }
  }

  public imageChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('sites.image_size_error', { maxPictureKb: this.maxSize });
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
    this.image = SiteImage.NO_IMAGE;
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
          this.saveSite(this.formGroup.value);
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private createSite(site: Site) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Yes: Update
    this.centralServerService.createSite(site).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('sites.create_success',
          { siteName: site.name });
        // close
        this.currentSiteID = site.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'sites.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Site deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('sites.site_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site.create_error');
      }
    });
  }

  private updateSite(site: Site) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Yes: Update
    this.centralServerService.updateSite(site).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('sites.update_success', { siteName: site.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'sites.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Site deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('sites.site_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.update_error');
      }
    });
  }
}
