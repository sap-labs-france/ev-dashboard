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
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import * as moment from 'moment';
import { mergeMap } from 'rxjs/operators';
import { RegistrationTokensTableDataSource } from '../../../settings/charging-station/registration-tokens/registration-tokens-table-data-source';
import { RegistrationToken } from 'app/types/RegistrationToken';
import { SiteArea } from 'app/types/SiteArea';
import { Site } from 'app/types/Site';


@Component({
  selector: 'app-site-area',
  templateUrl: 'site-area.component.html',
  providers: [RegistrationTokensTableDataSource],
})
export class SiteAreaComponent implements OnInit {
  @Input() currentSiteAreaID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;

  public image: any = Constants.SITE_AREA_NO_IMAGE;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public siteID!: AbstractControl;
  public maximumPower!: AbstractControl;
  public accessControl!: AbstractControl;

  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: FormArray;
  public isAdmin!: boolean;

  public sites: any;
  public registrationToken!: RegistrationToken;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    this.maxSize = this.configService.getSiteArea().maxPictureKb;

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateSiteArea()) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // refresh available sites
    this.refreshAvailableSites();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      siteID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      maximumPower: new FormControl('',
        Validators.compose([
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        ])),
      accessControl: new FormControl(true),
      address: new FormGroup({
        address1: new FormControl(''),
        address2: new FormControl(''),
        postalCode: new FormControl(''),
        city: new FormControl(''),
        department: new FormControl(''),
        region: new FormControl(''),
        country: new FormControl(''),
        coordinates: new FormArray ([
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
    this.siteID = this.formGroup.controls['siteID'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.accessControl = this.formGroup.controls['accessControl'];
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;

    this.isAdmin = this.authorizationService.canAccess(Constants.ENTITY_SITE_AREA, Constants.ACTION_CREATE);

    if (this.currentSiteAreaID) {
      this.loadSiteArea();
      this.loadRegistrationToken();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteAreaID = params['id'];
        // this.loadSiteArea();
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

  public setCurrentSiteAreaId(currentSiteAreaId: string) {
    this.currentSiteAreaID = currentSiteAreaId;
  }

  public refresh() {
    // Load SiteArea
    this.loadSiteArea();
  }

  public refreshAvailableSites() {
    const params = {
      SiteID: this.authorizationService.getSitesAdmin().join('|'),
    };
    this.centralServerService.getSites(params).subscribe((availableSites) => {
      // clear current entries
      this.sites = [];

      // add available companies to dropdown
      for (let i = 0; i < availableSites.count; i++) {
        this.sites.push({id: availableSites.result[i].id, name: availableSites.result[i].name});
      }
    });
  }

  public clearMaximumPower() {
    this.maximumPower.setValue(null);
    this.formGroup.markAsDirty();
  }

  public loadSiteArea() {
    if (!this.currentSiteAreaID) {
      return;
    }

    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    // tslint:disable-next-line:cyclomatic-complexity
    this.centralServerService.getSiteArea(this.currentSiteAreaID).pipe(mergeMap((siteArea) => {
      this.formGroup.markAsPristine();

      this.isAdmin = this.authorizationService.isSiteAdmin(siteArea.siteID);

      // if not admin switch in readonly mode
      if (!this.isAdmin) {
        this.formGroup.disable();
      }
      // Init form
      if (siteArea.id) {
        this.formGroup.controls.id.setValue(siteArea.id);
      }
      if (siteArea.name) {
        this.formGroup.controls.name.setValue(siteArea.name);
      }
      if (siteArea.siteID) {
        this.formGroup.controls.siteID.setValue(siteArea.siteID);
      }
      if (siteArea.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(siteArea.maximumPower);
      }
      if (siteArea.accessControl) {
        this.formGroup.controls.accessControl.setValue(siteArea.accessControl);
      } else {
        this.formGroup.controls.accessControl.setValue(false);
      }
      if (siteArea.address && siteArea.address.address1) {
        this.address.controls.address1.setValue(siteArea.address.address1);
      }
      if (siteArea.address && siteArea.address.address2) {
        this.address.controls.address2.setValue(siteArea.address.address2);
      }
      if (siteArea.address && siteArea.address.postalCode) {
        this.address.controls.postalCode.setValue(siteArea.address.postalCode);
      }
      if (siteArea.address && siteArea.address.city) {
        this.address.controls.city.setValue(siteArea.address.city);
      }
      if (siteArea.address && siteArea.address.department) {
        this.address.controls.department.setValue(siteArea.address.department);
      }
      if (siteArea.address && siteArea.address.region) {
        this.address.controls.region.setValue(siteArea.address.region);
      }
      if (siteArea.address && siteArea.address.country) {
        this.address.controls.country.setValue(siteArea.address.country);
      }
      if (siteArea.address && siteArea.address.coordinates && siteArea.address.coordinates.length === 2) {
        this.coordinates.at(0).setValue(siteArea.address.coordinates[0]);
        this.coordinates.at(1).setValue(siteArea.address.coordinates[1]);
      }
      // Yes, get image
      return this.centralServerService.getSiteAreaImage(this.currentSiteAreaID);
    })).subscribe((siteAreaImage) => {
      if (siteAreaImage && siteAreaImage.image) {
        this.image = siteAreaImage.image.toString();
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site_areas.site_invalid');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateSiteAreaImage(siteArea: SiteArea) {
    // Set the image
    if (!this.image.endsWith(Constants.SITE_AREA_NO_IMAGE)) {
      // Set to current image
      siteArea.image = this.image;
    } else {
      // No image
      delete siteArea.image;
    }
  }

  public saveSiteArea(siteArea: SiteArea) {
    if (this.currentSiteAreaID) {
      this.updateSiteArea(siteArea);
    } else {
      this.createSiteArea(siteArea);
    }
  }

  public generateRegistrationToken() {
    if (this.currentSiteAreaID) {
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('settings.charging_station.registration_token_creation_title'),
        this.translateService.instant('settings.charging_station.registration_token_creation_confirm'),
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_YES) {
          this.spinnerService.show();

          const selectedSite = this.sites.find((site: Site) => site.id === this.siteID.value);
          this.centralServerService.createRegistrationToken({
            siteAreaID: this.currentSiteAreaID,
            description: `Token for ${selectedSite.name} / ${this.name.value}`,
          }).subscribe((token) => {
            this.spinnerService.hide();
            if (token) {
              this.registrationToken = token;
              this.messageService.showSuccessMessage('settings.charging_station.registration_token_creation_success');
            } else {
              Utils.handleError(null,
                this.messageService, 'settings.charging_station.registration_token_creation_error');
            }
          }, (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'settings.charging_station.registration_token_creation_error');
          });
        }
      });
    }
  }

  public copyUrl(url: string) {
    Utils.copyToClipboard(url);
    this.messageService.showInfoMessage('settings.charging_station.url_copied');
  }

  public imageChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('site_areas.image_size_error', {maxPictureKb: this.maxSize});
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
    this.image = Constants.SITE_AREA_NO_IMAGE;
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
        if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === Constants.BUTTON_TYPE_SAVE_AND_CLOSE) {
          this.saveSiteArea(this.formGroup.value);
        } else if (result === Constants.BUTTON_TYPE_DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private loadRegistrationToken() {
    if (!this.currentSiteAreaID) {
      return;
    }
    this.centralServerService.getRegistrationTokens({
      siteAreaID: this.currentSiteAreaID,
    }).subscribe(((dataResult) => {
      if (dataResult && dataResult.result) {
        for (const registrationToken of dataResult.result) {
          if (this.isRegistrationTokenValid(registrationToken)) {
            this.registrationToken = registrationToken;
            break;
          }
        }
      }
    }));
  }

  private isRegistrationTokenValid(registrationToken: RegistrationToken): boolean {
    // @ts-ignore
    const now = moment();
    return registrationToken.expirationDate && now.isBefore(registrationToken.expirationDate)
      && (!registrationToken.revocationDate || now.isBefore(registrationToken.revocationDate));
  }

  private createSiteArea(siteArea: SiteArea) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteAreaImage(siteArea);
    // Yes: Update
    this.centralServerService.createSiteArea(siteArea).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('site_areas.create_success',
          {siteAreaName: siteArea.name});
        // Close
        this.currentSiteAreaID = siteArea.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'site_areas.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Site Area deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('site_areas.site_area_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site_areas.create_error');
      }
    });
  }

  private updateSiteArea(siteArea: SiteArea) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateSiteAreaImage(siteArea);
    // Yes: Update
    this.centralServerService.updateSiteArea(siteArea).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('site_areas.update_success', {siteAreaName: siteArea.name});
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'site_areas.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Site Area deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('site_areas.site_areas_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site_areas.update_error');
      }
    });
  }
}
