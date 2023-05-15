import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { DialogMode, SiteAreasAuthorizations } from 'types/Authorization';
import { Site } from 'types/Site';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { SiteArea, SiteAreaButtonAction, SubSiteAreaAction } from '../../../../types/SiteArea';
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';
import { SiteAreaLimitsComponent } from './limits/site-area-limits.component';
import { SiteAreaMainComponent } from './main/site-area-main.component';
import { SiteAreaOcpiComponent } from './ocpi/site-area-ocpi.component';

@Component({
  selector: 'app-site-area',
  templateUrl: 'site-area.component.html',
  styleUrls: ['site-area.component.scss'],
})
export class SiteAreaComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentSiteAreaID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public siteAreasAuthorizations!: SiteAreasAuthorizations;
  @Input() public smartChargingSessionParametersActive!: boolean;

  @ViewChild('siteAreaMainComponent') public siteAreaMainComponent!: SiteAreaMainComponent;
  @ViewChild('siteAreaLimitsComponent') public siteAreaLimitsComponent!: SiteAreaLimitsComponent;
  @ViewChild('siteAreaOcpiComponent') public siteAreaOcpiComponent!: SiteAreaOcpiComponent;

  public ocpiActive: boolean;
  public ocpiHasVisibleFields: boolean;

  public formGroup!: UntypedFormGroup;
  public readOnly = true;
  public siteArea: SiteArea;

  private subSiteAreaActions: SubSiteAreaAction[] = [];

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private dialogService: DialogService,
    private router: Router,
    protected windowService: WindowService,
    protected activatedRoute: ActivatedRoute
  ) {
    super(activatedRoute, windowService, ['main', 'limits', 'ocpi'], false);
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Check if OCPI has to be displayed
    this.ocpiHasVisibleFields = this.siteAreasAuthorizations.projectFields.includes('tariffID');
    // Load Site Area
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.currentSiteAreaID) {
      this.spinnerService.show();
      this.centralServerService.getSiteArea(this.currentSiteAreaID, true, true).subscribe({
        next: (siteArea) => {
          this.spinnerService.hide();
          this.siteArea = siteArea;
          // Check if OCPI has to be displayed
          this.ocpiHasVisibleFields = siteArea.projectFields.includes('tariffID');
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
              this.messageService.showErrorMessage('site_areas.site_invalid');
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
      this.saveSiteArea.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public siteChanged(site: Site) {
    this.siteAreaOcpiComponent?.siteChanged(site);
  }

  public saveSiteArea(siteArea: SiteArea, subSiteAreaActions: SubSiteAreaAction[]) {
    if (this.currentSiteAreaID) {
      this.updateSiteArea(siteArea, subSiteAreaActions);
    } else {
      this.createSiteArea(siteArea, subSiteAreaActions);
    }
  }

  private createSiteArea(siteArea: SiteArea, subSiteAreaActions: SubSiteAreaAction[] = []) {
    this.spinnerService.show();
    // Set the image
    this.siteAreaMainComponent.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.siteAreaMainComponent.updateSiteAreaCoordinates(siteArea);
    // Create
    this.centralServerService.createSiteArea(siteArea, subSiteAreaActions).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('site_areas.create_success', {
            siteAreaName: siteArea.name,
          });
          this.currentSiteAreaID = siteArea.id;
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'site_areas.create_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('site_areas.site_area_does_not_exist');
            break;
          default:
            this.handleHttpTreeError(siteArea, error, 'site_areas.create_error');
        }
      },
    });
  }

  private updateSiteArea(siteArea: SiteArea, subSiteAreaActions: SubSiteAreaAction[] = []) {
    this.spinnerService.show();
    // Set the image
    this.siteAreaMainComponent.updateSiteAreaImage(siteArea);
    // Set coordinates
    this.siteAreaMainComponent.updateSiteAreaCoordinates(siteArea);
    // Update
    this.centralServerService.updateSiteArea(siteArea, subSiteAreaActions).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('site_areas.update_success', {
            siteAreaName: siteArea.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'site_areas.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.THREE_PHASE_CHARGER_ON_SINGLE_PHASE_SITE_AREA:
            this.messageService.showErrorMessage('site_areas.update_phase_error');
            break;
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('site_areas.site_area_does_not_exist');
            break;
          case HTTPError.CLEAR_CHARGING_PROFILE_NOT_SUCCESSFUL:
            this.dialogService.createAndShowOkDialog(
              this.translateService.instant(
                'chargers.smart_charging.clearing_charging_profiles_not_successful_title'
              ),
              this.translateService.instant(
                'chargers.smart_charging.clearing_charging_profiles_not_successful_body',
                { siteAreaName: siteArea.name }
              )
            );
            this.closeDialog(true);
            break;
          default:
            this.handleHttpTreeError(siteArea, error, 'site_areas.update_error');
        }
      },
    });
  }

  private handleHttpTreeError(siteArea: SiteArea, error: any, defaultMessage: string) {
    switch (error.status) {
      case HTTPError.SITE_AREA_TREE_ERROR:
        this.dialogService.createAndShowOkDialog(
          this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
          this.translateService.instant('site_areas.site_area_tree_error')
        );
        break;
      case HTTPError.SITE_AREA_TREE_ERROR_SITE:
        this.dialogService
          .createAndShowDialog(
            this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
            this.translateService.instant('site_areas.site_area_tree_error_site'),
            [
              {
                id: SiteAreaButtonAction.SUB_SITE_AREA_UPDATE,
                name: 'site_areas.site_area_tree_error_site_update',
                color: 'primary',
              },
              {
                id: SiteAreaButtonAction.SUB_SITE_AREA_ATTACH,
                name: 'site_areas.site_area_tree_error_site_attach',
                color: 'primary',
              },
              {
                id: SiteAreaButtonAction.SUB_SITE_AREA_CLEAR,
                name: 'site_areas.site_area_tree_error_site_clear',
                color: 'warn',
              },
            ]
          )
          .subscribe((result: SiteAreaButtonAction) => {
            let subSiteAreaAction: SubSiteAreaAction;
            switch (result) {
              case SiteAreaButtonAction.SUB_SITE_AREA_ATTACH:
                subSiteAreaAction = SubSiteAreaAction.ATTACH;
                break;
              case SiteAreaButtonAction.SUB_SITE_AREA_UPDATE:
                subSiteAreaAction = SubSiteAreaAction.UPDATE;
                break;
              case SiteAreaButtonAction.SUB_SITE_AREA_CLEAR:
                subSiteAreaAction = SubSiteAreaAction.CLEAR;
                break;
            }
            if (subSiteAreaAction) {
              this.subSiteAreaActions.push(subSiteAreaAction);
              this.saveSiteArea(siteArea, this.subSiteAreaActions);
            }
          });
        break;
      case HTTPError.SITE_AREA_TREE_ERROR_SMART_CHARGING:
        this.dialogService
          .createAndShowYesNoDialog(
            this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
            this.translateService.instant('site_areas.site_area_tree_error_smart_charging')
          )
          .subscribe((result: ButtonAction) => {
            if (result === ButtonAction.YES) {
              this.subSiteAreaActions.push(SubSiteAreaAction.FORCE_SMART_CHARGING);
              this.saveSiteArea(siteArea, this.subSiteAreaActions);
            }
          });
        break;
      case HTTPError.SITE_AREA_TREE_ERROR_SMART_NBR_PHASES:
        this.dialogService.createAndShowOkDialog(
          this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
          this.translateService.instant('site_areas.site_area_tree_error_number_of_phases')
        );
        break;
      case HTTPError.SITE_AREA_TREE_ERROR_MULTIPLE_ACTIONS_NOT_SUPPORTED:
        this.dialogService.createAndShowOkDialog(
          this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
          this.translateService.instant(
            'site_areas.site_area_tree_error_multiple_actions_not_supported'
          )
        );
        this.subSiteAreaActions.length = 0;
        break;
      case HTTPError.SITE_AREA_TREE_ERROR_VOLTAGE:
        this.dialogService.createAndShowOkDialog(
          this.translateService.instant('site_areas.site_area_hierarchy_error_title'),
          this.translateService.instant('site_areas.site_area_tree_error_voltage')
        );
        break;
      default:
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          defaultMessage
        );
    }
  }
}
