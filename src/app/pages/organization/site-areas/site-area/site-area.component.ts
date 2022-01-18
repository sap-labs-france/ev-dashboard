import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { DialogMode } from 'types/Authorization';
import { Site } from 'types/Site';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { SiteArea } from '../../../../types/SiteArea';
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';
import { SiteAreaMainComponent } from './main/site-area-main.component';
import { SiteAreaOcpiComponent } from './site-area-ocpi/site-area-ocpi.component';

@Component({
  selector: 'app-site-area',
  templateUrl: 'site-area.component.html',
})
export class SiteAreaComponent extends AbstractTabComponent  implements OnInit {
  @Input() public currentSiteAreaID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;

  @ViewChild('siteAreaMainComponent') public siteAreaMainComponent!: SiteAreaMainComponent;
  @ViewChild('siteAreaOcpiComponent') public siteAreaOcpiComponent!: SiteAreaOcpiComponent;

  public ocpiActive: boolean;
  public ocpiHasVisibleFields: boolean;

  public formGroup!: FormGroup;
  public readOnly = true;
  public siteArea: SiteArea;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private dialogService: DialogService,
    private router: Router,
    protected windowService: WindowService,
    protected activatedRoute: ActivatedRoute,) {
    super(activatedRoute, windowService, ['common', 'site-area-ocpi'], false);
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({});
    this.readOnly = (this.dialogMode === DialogMode.VIEW);
    if (this.currentSiteAreaID) {
      this.loadSiteArea();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteAreaID = params['id'];
      });
    }
    // Handle Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadSiteArea() {
    if (this.currentSiteAreaID) {
      // Show spinner
      this.spinnerService.show();
      this.centralServerService.getSiteArea(this.currentSiteAreaID, true).subscribe((siteArea) => {
        this.spinnerService.hide();
        this.siteArea = siteArea;
        // Check if OCPI has to be displayed
        this.ocpiHasVisibleFields = siteArea.projectFields.includes('tariffID');
        // Update form group
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
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
  }

  public refresh() {
    this.loadSiteArea();
  }

  public saveSiteArea(siteArea: SiteArea) {
    if (this.currentSiteAreaID) {
      this.updateSiteArea(siteArea);
    } else {
      this.createSiteArea(siteArea);
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveSiteArea.bind(this), this.closeDialog.bind(this));
  }

  public siteChanged(site: Site) {
    this.siteAreaOcpiComponent?.siteChanged(site);
  }

  private createSiteArea(siteArea: SiteArea) {
    this.spinnerService.show();
    // Set the image
    this.siteAreaMainComponent.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.siteAreaMainComponent.updateSiteAreaCoordinates(siteArea);
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
    this.siteAreaMainComponent.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.siteAreaMainComponent.updateSiteAreaCoordinates(siteArea);
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
