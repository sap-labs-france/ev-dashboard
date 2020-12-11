import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { ConfigService } from '../../../../services/config.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SitesDialogComponent } from '../../../../shared/dialogs/sites/sites-dialog.component';
import { Address } from '../../../../types/Address';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { RegistrationToken } from '../../../../types/RegistrationToken';
import { Site } from '../../../../types/Site';
import { SiteArea } from '../../../../types/SiteArea';
import { ButtonType } from '../../../../types/Table';
import TenantComponents from '../../../../types/TenantComponents';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';
import { RegistrationTokensTableDataSource } from '../../../settings/registration-tokens/registration-tokens-table-data-source';

@Component({
  selector: 'app-site-area',
  templateUrl: 'site-area.component.html',
  providers: [RegistrationTokensTableDataSource],
})
export class SiteAreaComponent implements OnInit {
  @Input() public currentSiteAreaID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public image = Constants.NO_IMAGE;
  public imageHasChanged = false;
  public maxSize: number;
  public siteArea: SiteArea;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public site!: AbstractControl;
  public siteID!: AbstractControl;
  public maximumPower!: AbstractControl;
  public maximumPowerAmps!: AbstractControl;
  public voltage!: AbstractControl;
  public accessControl!: AbstractControl;
  public smartCharging!: AbstractControl;
  public numberOfPhases!: AbstractControl;

  public phaseMap = [
    { key: 1, description: 'site_areas.single_phased' },
    { key: 3, description: 'site_areas.three_phased' },
  ];

  public address!: Address;
  public isAdmin!: boolean;
  public isSmartChargingComponentActive = false;

  public registrationToken!: RegistrationToken;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private componentService: ComponentService,
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
    // Set
    this.isAdmin = this.authorizationService.canCreateSiteArea();
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
      site: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
      siteID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
      maximumPower: new FormControl(0,
        Validators.compose([
          Validators.pattern(/^[+-]?([0-9]*[.])?[0-9]+$/),
          Validators.min(1),
          Validators.required,
        ])
      ),
      maximumPowerAmps: new FormControl(0),
      accessControl: new FormControl(true),
      smartCharging: new FormControl(false),
      voltage: new FormControl(0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      numberOfPhases: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.site = this.formGroup.controls['site'];
    this.siteID = this.formGroup.controls['siteID'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.maximumPowerAmps = this.formGroup.controls['maximumPowerAmps'];
    this.smartCharging = this.formGroup.controls['smartCharging'];
    this.accessControl = this.formGroup.controls['accessControl'];
    this.voltage = this.formGroup.controls['voltage'];
    this.numberOfPhases = this.formGroup.controls['numberOfPhases'];
    this.maximumPowerAmps.disable();
    if (this.currentSiteAreaID) {
      this.loadSiteArea();
      this.loadRegistrationToken();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteAreaID = params['id'];
      });
    }
  }

  public assignSite() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'site_areas.assign_site',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true
      }
    };
    // Open
    this.dialog.open(SitesDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (result && result.length > 0 && result[0] && result[0].objectRef) {
        const site: Site = (result[0].objectRef) as Site;
        this.site.setValue(site.name);
        this.siteID.setValue(site.id);
        this.formGroup.markAsDirty();
      }
    });
  }

  public setCurrentSiteAreaId(currentSiteAreaId: string) {
    this.currentSiteAreaID = currentSiteAreaId;
  }

  public voltageChanged() {
    this.maximumPowerChanged();
  }

  public refresh() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (!this.currentSiteAreaID) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    this.centralServerService.getSiteArea(this.currentSiteAreaID, true).subscribe((siteArea) => {
      this.spinnerService.hide();
      this.siteArea = siteArea;
      this.isAdmin = this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(siteArea.siteID);
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
      if (siteArea.site) {
        this.site.setValue(siteArea.site.name);
      }
      if (siteArea.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(siteArea.maximumPower);
      }
      if (siteArea.numberOfPhases) {
        this.formGroup.controls.numberOfPhases.setValue(siteArea.numberOfPhases);
      }
      if (siteArea.voltage) {
        this.formGroup.controls.voltage.setValue(siteArea.voltage);
      }
      if (siteArea.smartCharging) {
        this.formGroup.controls.smartCharging.setValue(siteArea.smartCharging);
      } else {
        this.formGroup.controls.smartCharging.setValue(false);
      }
      if (siteArea.accessControl) {
        this.formGroup.controls.accessControl.setValue(siteArea.accessControl);
      } else {
        this.formGroup.controls.accessControl.setValue(false);
      }
      if (siteArea.address) {
        this.address = siteArea.address;
      }
      this.refreshMaximumAmps();
      // Force
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
      // Get Site image
      this.centralServerService.getSiteAreaImage(this.currentSiteAreaID).subscribe((siteAreaImage) => {
        this.image = siteAreaImage ? siteAreaImage : Constants.NO_IMAGE;
      });
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('site_areas.site_invalid');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public updateSiteAreaImage(siteArea: SiteArea) {
    if (this.imageHasChanged) {
      // Set new image
      if (this.image !== Constants.NO_IMAGE) {
        siteArea.image = this.image;
      } else {
        siteArea.image = null;
      }
    } else {
      // No changes
      delete siteArea.image;
    }
  }

  public updateSiteAreaCoordinates(siteArea: SiteArea) {
    if (siteArea.address && siteArea.address.coordinates &&
      !(siteArea.address.coordinates[0] || siteArea.address.coordinates[1])) {
      delete siteArea.address.coordinates;
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
        if (result === ButtonType.YES) {
          this.spinnerService.show();
          this.centralServerService.createRegistrationToken({
            siteAreaID: this.currentSiteAreaID,
            description: this.translateService.instant(
              'settings.charging_station.registration_token_site_area_name', { siteAreaName: this.siteArea.name }),
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

  public onImageChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('site_areas.image_size_error', { maxPictureKb: this.maxSize });
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
      this.translateService, this.saveSiteArea.bind(this), this.closeDialog.bind(this));
  }

  public refreshMaximumAmps() {
    this.maximumPowerChanged();
  }

  public maximumPowerChanged() {
    if (!this.maximumPower.errors && this.voltage.value) {
      this.maximumPowerAmps.setValue(
        Math.floor((this.maximumPower.value as number) / (this.voltage.value as number)));
    } else {
      this.maximumPowerAmps.setValue(0);
    }
  }

  private loadRegistrationToken() {
    if (!this.currentSiteAreaID) {
      return;
    }
    this.centralServerService.getRegistrationTokens({
      SiteAreaID: this.currentSiteAreaID,
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
    const now = moment();
    return registrationToken.expirationDate && now.isBefore(registrationToken.expirationDate)
      && (!registrationToken.revocationDate || now.isBefore(registrationToken.revocationDate));
  }

  private createSiteArea(siteArea: SiteArea) {
    this.spinnerService.show();
    // Set the image
    this.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.updateSiteAreaCoordinates(siteArea);
    // Create
    this.centralServerService.createSiteArea(siteArea).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('site_areas.create_success',
          { siteAreaName: siteArea.name });
        this.currentSiteAreaID = siteArea.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'site_areas.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('site_areas.site_area_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'site_areas.create_error');
      }
    });
  }

  private updateSiteArea(siteArea: SiteArea) {
    this.spinnerService.show();
    // Set the image
    this.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.updateSiteAreaCoordinates(siteArea);
    // Update
    this.centralServerService.updateSiteArea(siteArea).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('site_areas.update_success', { siteAreaName: siteArea.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'site_areas.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA:
          this.messageService.showErrorMessage('site_areas.update_phase_error');
          break;
        case HTTPError.CLEAR_CHARGING_PROFILE_NOT_SUCCESSFUL:
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('chargers.smart_charging.clearing_charging_profiles_not_successful_title'),
            this.translateService.instant('chargers.smart_charging.clearing_charging_profiles_not_successful_body',
              { siteAreaName: siteArea.name }));
          this.closeDialog(true);
          break;
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('site_areas.site_areas_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'site_areas.update_error');
      }
    });
  }
}
