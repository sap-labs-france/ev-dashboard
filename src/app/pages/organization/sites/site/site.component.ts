import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { DialogMode } from 'types/Authorization';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { Site } from '../../../../types/Site';
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';
import { SiteMainComponent } from './main/site-main.component';
import { SiteOcpiComponent } from './site-ocpi/site-ocpi.component';

@Component({
  selector: 'app-site',
  templateUrl: 'site.component.html',
})
export class SiteComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentSiteID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;

  @ViewChild('siteMainComponent') public siteMainComponent!: SiteMainComponent;
  @ViewChild('siteOcpiComponent') public siteOcpiComponent!: SiteOcpiComponent;

  public ocpiActive: boolean;
  public ocpiHasVisibleFields: boolean;

  public formGroup!: FormGroup;
  public readOnly = true;
  public site!: Site;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService) {
    super(activatedRoute, windowService, ['common', 'site-ocpi'], false);
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
    this.ocpiHasVisibleFields = true;
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({});
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    if (this.currentSiteID) {
      this.loadSite();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteID = params['id'];
      });
    }
    // Handle Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadSite() {
    if (this.currentSiteID) {
      this.spinnerService.show();
      this.centralServerService.getSite(this.currentSiteID, false, true).subscribe((site) => {
        this.spinnerService.hide();
        this.site = site;
        // Check if OCPI has to be displayed
        this.ocpiHasVisibleFields = site.projectFields.includes('tariffID');
        // Update form group
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
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

  public publicChanged(publicValue: boolean) {
    this.siteOcpiComponent?.publicChanged(publicValue);
  }

  public refresh() {
    this.loadSite();
  }

  public saveSite(site: Site) {
    if (this.currentSiteID) {
      this.updateSite(site);
    } else {
      this.createSite(site);
    }
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
    this.siteMainComponent.updateSiteImage(site);
    // Set coordinates
    this.siteMainComponent.updateSiteCoordinates(site);
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
    this.siteMainComponent.updateSiteImage(site);
    this.siteMainComponent.updateSiteCoordinates(site);
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
