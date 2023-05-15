import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import * as moment from 'moment';
import { SiteAreasDialogComponent } from 'shared/dialogs/site-areas/site-areas-dialog.component';
import { ButtonAction } from 'types/GlobalType';

import { CentralServerService } from '../../../../../services/central-server.service';
import { ConfigService } from '../../../../../services/config.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { SitesDialogComponent } from '../../../../../shared/dialogs/sites/sites-dialog.component';
import { Address } from '../../../../../types/Address';
import { RegistrationToken } from '../../../../../types/RegistrationToken';
import { Site } from '../../../../../types/Site';
import { SiteArea } from '../../../../../types/SiteArea';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-site-area-main',
  templateUrl: 'site-area-main.component.html',
})
export class SiteAreaMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public siteArea!: SiteArea;
  @Input() public readOnly: boolean;
  @Output() public siteChanged = new EventEmitter<Site>();

  public image = Constants.NO_IMAGE;
  public imageChanged = false;
  public maxSize: number;
  public initialized = false;

  public issuer!: AbstractControl;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public site!: AbstractControl;
  public siteID!: AbstractControl;
  public parentSiteArea!: AbstractControl;
  public parentSiteAreaID!: AbstractControl;
  public accessControl!: AbstractControl;

  public address!: Address;

  public registrationToken!: RegistrationToken;

  public constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router,
    private translateService: TranslateService,
    private configService: ConfigService
  ) {
    this.maxSize = this.configService.getSiteArea().maxPictureKb;
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('issuer', new UntypedFormControl(true));
    this.formGroup.addControl('id', new UntypedFormControl(''));
    this.formGroup.addControl(
      'name',
      new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(255)])
      )
    );
    this.formGroup.addControl(
      'site',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'siteID',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('parentSiteArea', new UntypedFormControl(null));
    this.formGroup.addControl('parentSiteAreaID', new UntypedFormControl(null));
    this.formGroup.addControl('accessControl', new UntypedFormControl(true));
    // Form
    this.issuer = this.formGroup.controls['issuer'];
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.site = this.formGroup.controls['site'];
    this.siteID = this.formGroup.controls['siteID'];
    this.parentSiteArea = this.formGroup.controls['parentSiteArea'];
    this.parentSiteAreaID = this.formGroup.controls['parentSiteAreaID'];
    this.accessControl = this.formGroup.controls['accessControl'];
    this.initialized = true;
    this.loadSiteArea();
  }

  public ngOnChanges() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.initialized && this.siteArea) {
      this.id.setValue(this.siteArea.id);
      if (Utils.objectHasProperty(this.siteArea, 'issuer')) {
        this.issuer.setValue(this.siteArea.issuer);
      }
      if (this.siteArea.name) {
        this.name.setValue(this.siteArea.name);
      }
      if (this.siteArea.siteID) {
        this.siteID.setValue(this.siteArea.siteID);
      }
      if (this.siteArea.site) {
        this.site.setValue(this.siteArea.site.name);
      }
      if (this.siteArea.parentSiteAreaID) {
        this.formGroup.controls.parentSiteAreaID.setValue(this.siteArea.parentSiteAreaID);
      }
      if (this.siteArea.parentSiteArea) {
        this.formGroup.controls.parentSiteArea.setValue(this.siteArea.parentSiteArea.name);
      }
      if (this.siteArea.accessControl) {
        this.accessControl.setValue(this.siteArea.accessControl);
      } else {
        this.accessControl.setValue(false);
      }
      if (this.siteArea.address) {
        this.address = this.siteArea.address;
      }
      this.loadRegistrationToken();
      // Get Site Area image
      if (!this.imageChanged) {
        this.centralServerService.getSiteAreaImage(this.siteArea.id).subscribe({
          next: (siteAreaImage) => {
            this.imageChanged = true;
            this.image = siteAreaImage ?? Constants.NO_IMAGE;
          },
          error: (error) => {
            switch (error.status) {
              case StatusCodes.NOT_FOUND:
                this.image = Constants.NO_IMAGE;
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
  }

  public assignSite() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'site_areas.assign_site',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
        SiteAdmin: true,
      },
    };
    // Open
    this.dialog
      .open(SitesDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const site: Site = result[0].objectRef as Site;
          if (this.siteID.value !== site.id) {
            this.site.setValue(site.name);
            this.siteID.setValue(site.id);
            this.siteChanged.emit(site);
            this.parentSiteArea.setValue(null);
            this.parentSiteAreaID.setValue(null);
            this.formGroup.markAsDirty();
          }
        }
      });
  }

  public assignParentSiteArea() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'site_areas.select_parent_site_area',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
        SiteID: this.siteID.value,
        ExcludeSiteAreaID: this.id?.value,
      },
    };
    // Open
    this.dialog
      .open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const parentSiteArea: SiteArea = result[0].objectRef as SiteArea;
          if (this.parentSiteAreaID.value !== parentSiteArea.id) {
            this.parentSiteArea.setValue(parentSiteArea.name);
            this.parentSiteAreaID.setValue(parentSiteArea.id);
            this.site.setValue(parentSiteArea.site.name);
            this.siteID.setValue(parentSiteArea.site.id);
            this.formGroup.markAsDirty();
          }
        }
      });
  }

  public updateSiteAreaCoordinates(siteArea: SiteArea) {
    if (
      siteArea.address &&
      siteArea.address.coordinates &&
      !(siteArea.address.coordinates[0] || siteArea.address.coordinates[1])
    ) {
      delete siteArea.address.coordinates;
    }
  }

  public updateSiteAreaImage(siteArea: SiteArea) {
    if (this.image !== Constants.NO_IMAGE) {
      siteArea.image = this.image;
    } else {
      siteArea.image = null;
    }
  }

  public clearImage() {
    this.image = Constants.NO_IMAGE;
    this.imageChanged = true;
    this.formGroup.markAsDirty();
  }

  public onImageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > this.maxSize * 1024) {
        this.messageService.showErrorMessage('site_areas.image_size_error', {
          maxPictureKb: this.maxSize,
        });
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

  public clearParent() {
    if (this.siteArea) {
      this.siteArea.parentSiteAreaID = null;
      this.siteArea.parentSiteArea = null;
    }
    this.parentSiteAreaID.setValue(null);
    this.parentSiteArea.setValue(null);
    this.formGroup.markAsDirty();
  }

  public generateRegistrationToken() {
    if (this.siteArea) {
      this.dialogService
        .createAndShowYesNoDialog(
          this.translateService.instant('chargers.connections.registration_token_creation_title'),
          this.translateService.instant('chargers.connections.registration_token_creation_confirm')
        )
        .subscribe((result) => {
          if (result === ButtonAction.YES) {
            this.spinnerService.show();
            this.centralServerService
              .createRegistrationToken({
                siteAreaID: this.siteArea.id,
                description: this.translateService.instant(
                  'chargers.connections.registration_token_site_area_name',
                  { siteAreaName: this.siteArea.name }
                ),
              })
              .subscribe({
                next: (token) => {
                  this.spinnerService.hide();
                  if (token) {
                    this.loadRegistrationToken();
                    this.messageService.showSuccessMessage(
                      'chargers.connections.registration_token_creation_success'
                    );
                  } else {
                    Utils.handleError(
                      null,
                      this.messageService,
                      'chargers.connections.registration_token_creation_error'
                    );
                  }
                },
                error: (error) => {
                  this.spinnerService.hide();
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'chargers.connections.registration_token_creation_error'
                  );
                },
              });
          }
        });
    }
  }

  public copyChargingStationConnectionUrl(url: string) {
    void Utils.copyToClipboard(url);
    this.messageService.showInfoMessage('chargers.connections.url_copied');
  }

  private loadRegistrationToken() {
    if (this.siteArea) {
      this.centralServerService
        .getRegistrationTokens({ SiteAreaID: this.siteArea.id })
        .subscribe((dataResult) => {
          if (dataResult && dataResult.result) {
            for (const registrationToken of dataResult.result) {
              if (this.isRegistrationTokenValid(registrationToken)) {
                this.registrationToken = registrationToken;
                break;
              }
            }
          }
        });
    }
  }

  private isRegistrationTokenValid(registrationToken: RegistrationToken): boolean {
    const now = moment();
    return (
      registrationToken.expirationDate &&
      now.isBefore(registrationToken.expirationDate) &&
      (!registrationToken.revocationDate || now.isBefore(registrationToken.revocationDate))
    );
  }
}
