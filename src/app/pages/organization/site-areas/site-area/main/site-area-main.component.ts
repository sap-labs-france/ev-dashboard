import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { CentralServerService } from '../../../../../services/central-server.service';
import { ComponentService } from '../../../../../services/component.service';
import { ConfigService } from '../../../../../services/config.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { SitesDialogComponent } from '../../../../../shared/dialogs/sites/sites-dialog.component';
import { Address } from '../../../../../types/Address';
import { RegistrationToken } from '../../../../../types/RegistrationToken';
import { Site } from '../../../../../types/Site';
import { SiteArea } from '../../../../../types/SiteArea';
import { ButtonType } from '../../../../../types/Table';
import { TenantComponents } from '../../../../../types/Tenant';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-site-area-main',
  templateUrl: 'site-area-main.component.html',
})
export class SiteAreaMainComponent implements OnInit,OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public currentSiteAreaID!: string;
  @Input() public siteArea!: SiteArea;
  @Input() public readOnly: boolean;
  @Output() public siteChanged = new EventEmitter<Site>();

  public image = Constants.NO_IMAGE;
  public siteAreaImageSet = false;
  public maxSize: number;

  public issuer!: AbstractControl;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public site!: AbstractControl;
  public siteID!: AbstractControl;
  public maximumPower!: AbstractControl;
  public maximumTotalPowerAmps!: AbstractControl;
  public maximumPowerAmpsPerPhase!: AbstractControl;
  public voltage!: AbstractControl;
  public accessControl!: AbstractControl;
  public smartCharging!: AbstractControl;
  public numberOfPhases!: AbstractControl;

  public phaseMap = [
    { key: 1, description: 'site_areas.single_phased' },
    { key: 3, description: 'site_areas.three_phased' },
  ];

  public address!: Address;
  public isSmartChargingComponentActive = false;

  public registrationToken!: RegistrationToken;

  public constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router,
    private translateService: TranslateService,
    private configService: ConfigService,
    private componentService: ComponentService) {
    this.maxSize = this.configService.getSiteArea().maxPictureKb;
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('issuer', new FormControl(true));
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl('name', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(255),
      ])
    ));
    this.formGroup.addControl('site', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('siteID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    this.formGroup.addControl('maximumPower', new FormControl(0,
      Validators.compose([
        Validators.pattern(/^[+-]?([0-9]*[.])?[0-9]+$/),
        Validators.min(1),
        Validators.required,
      ])
    ));
    this.formGroup.addControl('maximumPowerAmpsPerPhase', new FormControl(0));
    this.formGroup.addControl('maximumTotalPowerAmps', new FormControl(0));
    this.formGroup.addControl('accessControl', new FormControl(true));
    this.formGroup.addControl('smartCharging', new FormControl(false));
    this.formGroup.addControl('voltage', new FormControl(0,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[+]?[0-9]*$'),
      ])
    ));
    this.formGroup.addControl('numberOfPhases', new FormControl('',
      Validators.compose([
        Validators.required,
      ])
    ));
    // Form
    this.issuer = this.formGroup.controls['issuer'];
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.site = this.formGroup.controls['site'];
    this.siteID = this.formGroup.controls['siteID'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.maximumPowerAmpsPerPhase = this.formGroup.controls['maximumPowerAmpsPerPhase'];
    this.maximumTotalPowerAmps = this.formGroup.controls['maximumTotalPowerAmps'];
    this.smartCharging = this.formGroup.controls['smartCharging'];
    this.accessControl = this.formGroup.controls['accessControl'];
    this.voltage = this.formGroup.controls['voltage'];
    this.numberOfPhases = this.formGroup.controls['numberOfPhases'];
    this.maximumPowerAmpsPerPhase.disable();
    this.maximumTotalPowerAmps.disable();
    if (this.readOnly) {
      this.formGroup.disable();
    }
    if (this.currentSiteAreaID) {
      this.loadRegistrationToken();
    }
  }

  public ngOnChanges() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.siteArea) {
      this.formGroup.controls.id.setValue(this.siteArea.id);
      if (Utils.objectHasProperty(this.siteArea, 'issuer')) {
        this.formGroup.controls.issuer.setValue(this.siteArea.issuer);
      }
      if (this.siteArea.name) {
        this.formGroup.controls.name.setValue(this.siteArea.name);
      }
      if (this.siteArea.siteID) {
        this.formGroup.controls.siteID.setValue(this.siteArea.siteID);
      }
      if (this.siteArea.site) {
        this.site.setValue(this.siteArea.site.name);
      }
      if (this.siteArea.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.siteArea.maximumPower);
      }
      if (this.siteArea.numberOfPhases) {
        this.formGroup.controls.numberOfPhases.setValue(this.siteArea.numberOfPhases);
      }
      if (this.siteArea.voltage) {
        this.formGroup.controls.voltage.setValue(this.siteArea.voltage);
      }
      if (this.siteArea.smartCharging) {
        this.formGroup.controls.smartCharging.setValue(this.siteArea.smartCharging);
      } else {
        this.formGroup.controls.smartCharging.setValue(false);
      }
      if (this.siteArea.accessControl) {
        this.formGroup.controls.accessControl.setValue(this.siteArea.accessControl);
      } else {
        this.formGroup.controls.accessControl.setValue(false);
      }
      if (this.siteArea.address) {
        this.address = this.siteArea.address;
      }
      this.refreshMaximumAmps();
      // Get Site Area image
      if (!this.siteAreaImageSet) {
        this.centralServerService.getSiteAreaImage(this.currentSiteAreaID).subscribe((siteAreaImage) => {
          this.siteAreaImageSet = true;
          if (siteAreaImage) {
            this.image = siteAreaImage;
          }
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
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
        SiteAdmin: true,
      }
    };
    // Open
    this.dialog.open(SitesDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const site: Site = (result[0].objectRef) as Site;
        this.site.setValue(site.name);
        this.siteID.setValue(site.id);
        this.siteChanged.emit(site);
        this.formGroup.markAsDirty();
      }
    });
  }

  public updateSiteAreaCoordinates(siteArea: SiteArea) {
    if (siteArea.address && siteArea.address.coordinates &&
      !(siteArea.address.coordinates[0] || siteArea.address.coordinates[1])) {
      delete siteArea.address.coordinates;
    }
  }

  public voltageChanged() {
    this.maximumPowerChanged();
  }

  public numberOfPhasesChanged() {
    this.maximumPowerChanged();
  }

  public updateSiteAreaImage(siteArea: SiteArea) {
    if (this.image !== Constants.USER_NO_PICTURE) {
      siteArea.image = this.image;
    } else {
      siteArea.image = null;
    }
  }

  public clearImage() {
    this.image = Constants.NO_IMAGE;
    this.siteAreaImageSet = false;
    this.formGroup.markAsDirty();
  }

  public onImageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('site_areas.image_size_error', { maxPictureKb: this.maxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.siteAreaImageSet = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public refreshMaximumAmps() {
    this.maximumPowerChanged();
  }

  public maximumPowerChanged() {
    if (!this.maximumPower.errors && this.voltage.value) {
      if (this.numberOfPhases.value) {
        this.maximumPowerAmpsPerPhase.setValue(
          Math.floor((this.maximumPower.value as number) / (this.voltage.value as number) / (this.numberOfPhases.value)));
      } else {
        this.maximumPowerAmpsPerPhase.setValue(0);
      }
      this.maximumTotalPowerAmps.setValue(
        Math.floor((this.maximumPower.value as number) / (this.voltage.value as number)));
    } else {
      this.maximumPowerAmpsPerPhase.setValue(0);
      this.maximumTotalPowerAmps.setValue(0);
    }
  }

  public generateRegistrationToken() {
    if (this.currentSiteAreaID) {
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.connections.registration_token_creation_title'),
        this.translateService.instant('chargers.connections.registration_token_creation_confirm'),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          this.spinnerService.show();
          this.centralServerService.createRegistrationToken({
            siteAreaID: this.currentSiteAreaID,
            description: this.translateService.instant(
              'chargers.connections.registration_token_site_area_name', { siteAreaName: this.siteArea.name }),
          }).subscribe((token) => {
            this.spinnerService.hide();
            if (token) {
              this.loadRegistrationToken();
              this.messageService.showSuccessMessage('chargers.connections.registration_token_creation_success');
            } else {
              Utils.handleError(null,
                this.messageService, 'chargers.connections.registration_token_creation_error');
            }
          }, (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'chargers.connections.registration_token_creation_error');
          });
        }
      });
    }
  }

  public copyUrl(url: string) {
    Utils.copyToClipboard(url);
    this.messageService.showInfoMessage('chargers.connections.url_copied');
  }

  private loadRegistrationToken() {
    if (this.currentSiteAreaID) {
      this.centralServerService.getRegistrationTokens(
        { SiteAreaID: this.currentSiteAreaID }).subscribe(((dataResult) => {
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
  }

  private isRegistrationTokenValid(registrationToken: RegistrationToken): boolean {
    const now = moment();
    return registrationToken.expirationDate && now.isBefore(registrationToken.expirationDate)
      && (!registrationToken.revocationDate || now.isBefore(registrationToken.revocationDate));
  }
}
