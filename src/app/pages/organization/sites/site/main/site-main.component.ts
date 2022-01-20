import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { Address } from 'types/Address';
import { CentralServerService } from 'services/central-server.service';
import { CompaniesDialogComponent } from 'shared/dialogs/companies/companies-dialog.component';
import { Company } from 'types/Company';
import { ConfigService } from 'services/config.service';
import { Constants } from 'utils/Constants';
import { MessageService } from 'services/message.service';
import { Site } from 'types/Site';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-site-main',
  templateUrl: './site-main.component.html',
})
export class SiteMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public currentSiteID!: string;
  @Input() public site!: Site;
  @Input() public readOnly: boolean;
  @Output() public publicChanged = new EventEmitter<boolean>();

  public image = Constants.NO_IMAGE;
  public siteImageSet = false;
  public maxSize: number;

  public issuer!: AbstractControl;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public company!: AbstractControl;
  public companyID!: AbstractControl;
  public autoUserSiteAssignment!: AbstractControl;
  public public!: AbstractControl;

  public address!: Address;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private configService: ConfigService,
    private messageService: MessageService) {
    this.maxSize = this.configService.getSite().maxPictureKb;
  }

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('issuer', new FormControl(true));
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl('name', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(255),
      ])));
    this.formGroup.addControl('company', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('companyID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('autoUserSiteAssignment', new FormControl(false));
    this.formGroup.addControl('public', new FormControl(false));
    // Form
    this.issuer = this.formGroup.controls['issuer'];
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.company = this.formGroup.controls['company'];
    this.companyID = this.formGroup.controls['companyID'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.public = this.formGroup.controls['public'];
    if (this.readOnly) {
      this.formGroup.disable();
    }
  }

  public ngOnChanges() {
    this.loadSite();
  }

  public loadSite() {
    if (this.site) {
      this.formGroup.controls.id.setValue(this.site.id);
      if (Utils.objectHasProperty(this.site, 'issuer')) {
        this.formGroup.controls.issuer.setValue(this.site.issuer);
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
      if (this.site.metadata?.autoUserSiteAssignment && !this.site.metadata?.autoUserSiteAssignment.enabled) {
        this.formGroup.controls.autoUserSiteAssignment.disable();
      }
      // Get Site image
      if (!this.siteImageSet) {
        this.centralServerService.getSiteImage(this.currentSiteID).subscribe((siteImage) => {
          this.siteImageSet = true;
          if (siteImage) {
            this.image = siteImage;
          }
        });
      }
    }
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

  public updateSiteCoordinates(site: Site) {
    if (site.address && site.address.coordinates &&
      !(site.address.coordinates[0] || site.address.coordinates[1])) {
      delete site.address.coordinates;
    }
  }

  public changePublic(): void {
    this.publicChanged.emit(this.public.value);
  }

  public updateSiteImage(site: Site) {
    if (this.image !== Constants.USER_NO_PICTURE) {
      site.image = this.image;
    } else {
      site.image = null;
    }
  }

  public clearImage() {
    this.image = Constants.NO_IMAGE;
    this.siteImageSet = false;
    this.formGroup.markAsDirty();
  }

  public onImageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('sites.image_size_error', { maxPictureKb: this.maxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.siteImageSet = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
