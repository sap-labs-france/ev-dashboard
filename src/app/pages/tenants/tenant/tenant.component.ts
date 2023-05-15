import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AbstractTabComponent } from '../../../shared/component/abstract-tab/abstract-tab.component';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { Tenant, TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { TenantComponentsComponent } from './components/tenant-components.component';
import { TenantMainComponent } from './main/tenant-main.component';

@Component({
  selector: 'app-tenant',
  templateUrl: 'tenant.component.html',
  styleUrls: ['tenant.component.scss'],
})
export class TenantComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentTenantID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  @ViewChild('tenantMainComponent') public tenantMainComponent!: TenantMainComponent;
  @ViewChild('tenantComponentsComponent')
  public tenantComponentsComponent!: TenantComponentsComponent;

  public formGroup!: UntypedFormGroup;
  public tenant!: Tenant;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['main', 'components'], false);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    if (this.currentTenantID) {
      this.loadTenant();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentTenantID = params['id'];
      });
    }
  }

  public loadTenant() {
    if (this.currentTenantID) {
      this.spinnerService.show();
      this.centralServerService.getTenant(this.currentTenantID).subscribe({
        next: (tenant) => {
          this.spinnerService.hide();
          if (tenant) {
            this.tenant = tenant;
            // Update form group
            this.formGroup.updateValueAndValidity();
            this.formGroup.markAsPristine();
            this.formGroup.markAllAsTouched();
          }
        },
        error: (error) => {
          // Hide
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('tenants.tenant_not_found');
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
          this.dialogRef.close();
        },
      });
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveTenant.bind(this),
      this.closeDialog.bind(this)
    );
  }

  // eslint-disable-next-line complexity
  public saveTenant(tenant: Tenant) {
    // Clear Type of inactive tenants
    let pricingActive = false;
    let refundActive = false;
    let billingActive = false;
    let billingPlatformActive = false;
    let smartChargingActive = false;
    let organizationActive = false;
    let assetActive = false;
    let carActive = false;
    let carConnectorActive = false;
    let ocpiActive = false;
    let oicpActive = false;
    let reservationActive = false;
    for (const component in tenant.components) {
      if (Utils.objectHasProperty(tenant.components, component)) {
        if (!tenant.components[component].active) {
          tenant.components[component].type = null;
        }
        if (component === TenantComponents.PRICING) {
          pricingActive = tenant.components[component].active;
        }
        if (component === TenantComponents.REFUND) {
          refundActive = tenant.components[component].active;
        }
        if (component === TenantComponents.BILLING) {
          billingActive = tenant.components[component].active;
        }
        if (component === TenantComponents.BILLING_PLATFORM) {
          billingPlatformActive = tenant.components[component].active;
        }
        if (component === TenantComponents.SMART_CHARGING) {
          smartChargingActive = tenant.components[component].active;
        }
        if (component === TenantComponents.ORGANIZATION) {
          organizationActive = tenant.components[component].active;
        }
        if (component === TenantComponents.ASSET) {
          assetActive = tenant.components[component].active;
        }
        if (component === TenantComponents.CAR) {
          carActive = tenant.components[component].active;
        }
        if (component === TenantComponents.CAR_CONNECTOR) {
          carConnectorActive = tenant.components[component].active;
        }
        if (component === TenantComponents.OCPI) {
          ocpiActive = tenant.components[component].active;
        }
        if (component === TenantComponents.OICP) {
          oicpActive = tenant.components[component].active;
        }
        if (component === TenantComponents.RESERVATION) {
          reservationActive = tenant.components[component].active;
        }
      }
    }
    if (oicpActive && ocpiActive) {
      this.messageService.showErrorMessage('tenants.save_error_roaming');
      return;
    }
    if (refundActive && !pricingActive) {
      this.messageService.showErrorMessage('tenants.save_error_refund');
      return;
    }
    if (billingActive && !pricingActive) {
      this.messageService.showErrorMessage('tenants.save_error_billing');
      return;
    }
    if (billingPlatformActive && !billingActive) {
      this.messageService.showErrorMessage('tenants.save_error_billing_platform');
      return;
    }
    if (smartChargingActive && !organizationActive) {
      this.messageService.showErrorMessage('tenants.save_error_smart_charging');
      return;
    }
    if (assetActive && !organizationActive) {
      this.messageService.showErrorMessage('tenants.save_error_asset');
      return;
    }
    if (carConnectorActive && !carActive) {
      this.messageService.showErrorMessage('tenants.save_error_car_connector');
      return;
    }
    if (reservationActive && !organizationActive) {
      this.messageService.showErrorMessage('tenants.save_error_reservation');
      return;
    }
    if (this.tenant) {
      this.updateTenant(tenant);
    } else {
      this.createTenant(tenant);
    }
  }

  private createTenant(tenant: Tenant) {
    this.spinnerService.show();
    this.tenantMainComponent.updateTenantLogo(tenant);
    this.centralServerService.createTenant(tenant).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tenants.create_success', { name: tenant.name });
          this.dialogRef.close(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tenants.create_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.TENANT_ALREADY_EXIST:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tenants.subdomain_already_used',
              { subdomain: tenant.subdomain }
            );
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tenants.create_error'
            );
            break;
        }
      },
    });
  }

  private updateTenant(tenant: Tenant) {
    this.spinnerService.show();
    this.tenantMainComponent.updateTenantLogo(tenant);
    this.centralServerService.updateTenant(tenant).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tenants.update_success', { name: tenant.name });
          this.dialogRef.close(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tenants.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.TENANT_ALREADY_EXIST:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tenants.subdomain_already_used',
              { subdomain: tenant.subdomain }
            );
            break;
          case HTTPError.SMART_CHARGING_STILL_ACTIVE_FOR_SITE_AREA:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tenants.smart_charging_still_active_for_site_area'
            );
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tenants.update_error'
            );
            break;
        }
      },
    });
  }
}
