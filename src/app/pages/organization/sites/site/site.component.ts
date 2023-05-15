import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { AccountBillingComponent } from 'shared/component/account-billing/account-billing.component';
import { DialogMode, SitesAuthorizations } from 'types/Authorization';

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
import { SiteOcpiComponent } from './ocpi/site-ocpi.component';

@Component({
  selector: 'app-site',
  templateUrl: 'site.component.html',
  styleUrls: ['site.component.scss'],
})
export class SiteComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentSiteID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public sitesAuthorizations!: SitesAuthorizations;

  @ViewChild('siteMainComponent') public siteMainComponent!: SiteMainComponent;
  @ViewChild('siteOcpiComponent') public siteOcpiComponent!: SiteOcpiComponent;
  @ViewChild('accountBillingComponent') public accountBillingComponent!: AccountBillingComponent;

  public ocpiActive: boolean;
  public ocpiHasVisibleFields: boolean;

  public formGroup!: UntypedFormGroup;
  public readOnly = true;
  public site!: Site;
  public isBillingActive = false;
  public isBillingPlatformActive = false;
  public accountHasVisibleFields: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['main', 'ocpi'], false);
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
    this.isBillingActive = this.componentService.isActive(TenantComponents.BILLING);
    this.isBillingPlatformActive = this.componentService.isActive(
      TenantComponents.BILLING_PLATFORM
    );
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Check if OCPI has to be displayed
    this.ocpiHasVisibleFields = this.sitesAuthorizations.projectFields.includes('tariffID');
    // Load Site
    this.loadSite();
  }

  public loadSite() {
    if (this.currentSiteID) {
      this.spinnerService.show();
      this.centralServerService.getSite(this.currentSiteID, false, true).subscribe({
        next: (site) => {
          this.spinnerService.hide();
          this.site = site;
          // Check if Account Data is to be displayed
          this.accountHasVisibleFields = site.projectFields.includes('accountData.accountID');
          // Check if OCPI has to be displayed
          this.ocpiHasVisibleFields = site.projectFields.includes('tariffID');
          if (this.readOnly) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('sites.site_not_found');
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

  public publicChanged(publicValue: boolean) {
    this.siteOcpiComponent?.publicChanged(publicValue);
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveSite.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveSite(site: Site) {
    if (this.currentSiteID) {
      this.updateSite(site);
    } else {
      this.createSite(site);
    }
  }

  private createSite(site: Site) {
    this.spinnerService.show();
    // Set the image
    this.siteMainComponent.updateSiteImage(site);
    // Set coordinates
    this.siteMainComponent.updateSiteCoordinates(site);
    // Create
    this.centralServerService.createSite(site).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('sites.create_success', { siteName: site.name });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'sites.create_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('sites.site_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'sites.create_error'
            );
        }
      },
    });
  }

  private updateSite(site: Site) {
    this.spinnerService.show();
    this.siteMainComponent.updateSiteImage(site);
    this.siteMainComponent.updateSiteCoordinates(site);
    // Set connected account
    this.accountBillingComponent?.updateEntityConnectedAccount(site);
    // Update
    this.centralServerService.updateSite(site).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('sites.update_success', { siteName: site.name });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'sites.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('sites.site_not_found');
            break;
          case HTTPError.FEATURE_NOT_SUPPORTED_ERROR:
            this.messageService.showErrorMessage('sites.update_public_site_error', {
              siteName: site.name,
            });
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'sites.update_error'
            );
        }
      },
    });
  }
}
