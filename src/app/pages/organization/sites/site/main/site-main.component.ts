import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { CentralServerService } from 'services/central-server.service';
import { ConfigService } from 'services/config.service';
import { MessageService } from 'services/message.service';
import { CompaniesDialogComponent } from 'shared/dialogs/companies/companies-dialog.component';
import { Address } from 'types/Address';
import { Company } from 'types/Company';
import { Site } from 'types/Site';
import { Constants } from 'utils/Constants';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-site-main',
  templateUrl: 'site-main.component.html',
})
export class SiteMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public site!: Site;
  @Input() public readOnly: boolean;
  @Output() public publicChanged = new EventEmitter<boolean>();

  public image = Constants.NO_IMAGE;
  public imageChanged = false;
  public maxSize: number;
  public initialized = false;

  public issuer!: AbstractControl;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public company!: AbstractControl;
  public companyID!: AbstractControl;
  public autoUserSiteAssignment!: AbstractControl;
  public public!: AbstractControl;

  public address = {} as Address;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private configService: ConfigService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.maxSize = this.configService.getSite().maxPictureKb;
  }

  public ngOnInit(): void {
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
      'company',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'companyID',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('autoUserSiteAssignment', new UntypedFormControl(false));
    this.formGroup.addControl('public', new UntypedFormControl(false));
    // Form
    this.id = this.formGroup.controls['id'];
    this.issuer = this.formGroup.controls['issuer'];
    this.name = this.formGroup.controls['name'];
    this.company = this.formGroup.controls['company'];
    this.companyID = this.formGroup.controls['companyID'];
    this.autoUserSiteAssignment = this.formGroup.controls['autoUserSiteAssignment'];
    this.public = this.formGroup.controls['public'];
    this.initialized = true;
    this.loadSite();
  }

  public ngOnChanges() {
    this.loadSite();
  }

  public loadSite() {
    if (this.initialized && this.site) {
      this.id.setValue(this.site.id);
      if (Utils.objectHasProperty(this.site, 'issuer')) {
        this.issuer.setValue(this.site.issuer);
      }
      if (this.site.name) {
        this.name.setValue(this.site.name);
      }
      if (this.site.companyID) {
        this.companyID.setValue(this.site.companyID);
      }
      if (this.site.company) {
        this.company.setValue(this.site.company.name);
      }
      if (this.site.autoUserSiteAssignment) {
        this.autoUserSiteAssignment.setValue(this.site.autoUserSiteAssignment);
      } else {
        this.autoUserSiteAssignment.setValue(false);
      }
      if (this.site.public) {
        this.public.setValue(this.site.public);
      } else {
        this.public.setValue(false);
      }
      if (this.site.address) {
        this.address = this.site.address;
      }
      if (
        this.site.metadata?.autoUserSiteAssignment &&
        !this.site.metadata?.autoUserSiteAssignment.enabled
      ) {
        this.autoUserSiteAssignment.disable();
      }
      // Get Site image
      if (!this.imageChanged) {
        this.centralServerService.getSiteImage(this.site.id).subscribe({
          next: (siteImage) => {
            this.imageChanged = true;
            this.image = siteImage ?? Constants.NO_IMAGE;
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

  public assignCompany() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'sites.assign_company',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
      },
    };
    // Open
    this.dialog
      .open(CompaniesDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const company: Company = result[0].objectRef as Company;
          this.company.setValue(company.name);
          this.companyID.setValue(company.id);
          this.formGroup.markAsDirty();
        }
      });
  }

  public updateSiteCoordinates(site: Site) {
    if (
      site.address &&
      site.address.coordinates &&
      !(site.address.coordinates[0] || site.address.coordinates[1])
    ) {
      delete site.address.coordinates;
    }
  }

  public changePublic(): void {
    this.publicChanged.emit(this.public.value);
  }

  public updateSiteImage(site: Site) {
    if (this.image !== Constants.NO_IMAGE) {
      site.image = this.image;
    } else {
      site.image = null;
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
        this.messageService.showErrorMessage('sites.image_size_error', {
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
}
