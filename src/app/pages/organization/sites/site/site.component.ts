import { mergeMap } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';

import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AuthorizationService } from 'app/services/authorization-service';
import { MessageService } from 'app/services/message.service';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { DialogService } from 'app/services/dialog.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-site-cmp',
  templateUrl: 'site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentSiteID: string;
  @Input() inDialog: boolean;
  @Input() dialogRef: MatDialogRef<any>;

  public isAdmin = false;
  public image: any = Constants.SITE_NO_IMAGE;

  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public companyID: AbstractControl;
  public allowAllUsersToStopTransactions: AbstractControl;
  public autoUserSiteAssignment: AbstractControl;

  public address: FormGroup;
  public address1: AbstractControl;
  public address2: AbstractControl;
  public postalCode: AbstractControl;
  public city: AbstractControl;
  public department: AbstractControl;
  public region: AbstractControl;
  public country: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public companies: any;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateSite({ 'id': this.activatedRoute.snapshot.params['id'] })) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // get admin flag
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();

    // refresh comapnies
    this.refreshAvailableCompanies();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'companyID': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'allowAllUsersToStopTransactions': new FormControl(false),
      'autoUserSiteAssignment': new FormControl(false),
      'address': new FormGroup({
        'address1': new FormControl(''),
        'address2': new FormControl(''),
        'postalCode': new FormControl(''),
        'city': new FormControl(''),
        'department': new FormControl(''),
        'region': new FormControl(''),
        'country': new FormControl(''),
        'latitude': new FormControl('',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE)
          ])),
        'longitude': new FormControl('',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE)
          ]))
      })
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.companyID = this.formGroup.controls['companyID'];
    this.allowAllUsersToStopTransactions = this.formGroup.controls['allowAllUsersToStopTransactions'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.address = <FormGroup>this.formGroup.controls['address'];
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.latitude = this.address.controls['latitude'];
    this.longitude = this.address.controls['longitude'];

    // if not admin switch in readonly mode
    if (!this.isAdmin) {
      this.formGroup.disable();
    }

    if (this.currentSiteID) {
      this.loadSite();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteID = params['id'];
        // this.loadSite();
      });
    }
    // Scroll up
    jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });

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

  public setCurrentSiteId(currentSiteId) {
    this.currentSiteID = currentSiteId;
  }

  public showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
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
        this.companies.push({ 'id': availableCompanies.result[i].id, 'name': availableCompanies.result[i].name })
      }
    });
  }

  public loadSite() {
    // refresh available companies
    this.refreshAvailableCompanies();

    if (!this.currentSiteID) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
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
      if (site.allowAllUsersToStopTransactions) {
        this.formGroup.controls.allowAllUsersToStopTransactions.setValue(site.allowAllUsersToStopTransactions);
      } else {
        this.formGroup.controls.allowAllUsersToStopTransactions.setValue(false);
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
      if (site.address && site.address.latitude) {
        this.address.controls.latitude.setValue(site.address.latitude);
      }
      if (site.address && site.address.longitude) {
        this.address.controls.longitude.setValue(site.address.longitude);
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

  public updateSiteImage(site) {
    // Check no image?
    if (!this.image.endsWith(Constants.SITE_NO_IMAGE)) {
      // Set to site
      site.image = this.image;
    } else {
      // No image
      site.image = null;
    }
  }

  public saveSite(site) {
    if (this.currentSiteID) {
      this._updateSite(site);
    } else {
      this._createSite(site);
    }
  }

  private _createSite(site) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Yes: Update
    this.centralServerService.createSite(site).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('sites.create_success',
          { 'siteName': site.name });
        // close
        this.currentSiteID = site.id;
        this.closeDialog();
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

  private _updateSite(site) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteImage(site);
    // Yes: Update
    this.centralServerService.updateSite(site).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('sites.update_success', { 'siteName': site.name });
        this.closeDialog();
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

  public imageChanged(event) {
    // load picture
    let reader = new FileReader(); // tslint:disable-line
    const file = event.target.files[0];
    reader.onload = () => {
      this.image = reader.result;
    };
    reader.readAsDataURL(file);
    this.formGroup.markAsDirty();
  }

  public clearImage() {
    // Clear
    this.image = Constants.SITE_NO_IMAGE;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public closeDialog() {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.dialog,
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text')
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.dialog,
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text')
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_SAVE_AND_CLOSE) {
          this.saveSite(this.formGroup.value);
        } else if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }
}
