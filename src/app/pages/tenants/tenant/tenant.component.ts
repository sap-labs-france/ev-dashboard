import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { Tenant } from 'app/types/Tenant';
import { debounceTime } from 'rxjs/operators';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentType } from '../../../services/component.service';
import { ConfigService } from '../../../services/config.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: './tenant.component.html',
})
export class TenantComponent implements OnInit {
  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public subdomain!: AbstractControl;
  public email!: AbstractControl;
  public components!: FormGroup;
  public tenantID!: string;
  public pricingTypes = [
    {
      key: 'convergentCharging',
      description: 'settings.pricing.convergentcharging.title',
    }, {
      key: 'simple',
      description: 'settings.pricing.simple.title',
    },
  ];
  public billingTypes = [
    {
      key: 'stripe',
      description: 'settings.billing.stripe.title',
    },
  ];
  public refundTypes = [
    {
      key: 'concur',
      description: 'settings.refund.concur.title',
    },
  ];
  public ocpiTypes = [
    {
      key: 'gireve',
      description: 'settings.ocpi.gireve.title',
    },
  ];
  public analyticsTypes = [
    {
      key: 'sac',
      description: 'settings.analytics.sac.title',
    },
  ];
  public smartChargingTypes = [
    {
      key: 'sapSmartCharging',
      description: 'settings.smartCharging.sapSmartCharging.title',
    },
  ];
  private currentTenant!: Tenant;

  constructor(
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private configService: ConfigService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    protected dialogRef: MatDialogRef<TenantComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Check if data is passed to the dialog
    if (data) {
      this.tenantID = data.id;
    }
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      email: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email,
        ])),
      subdomain: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[a-z0-9]+$'),
        ])),
      components: new FormGroup({}),
    });
    // Assign
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.components = (this.formGroup.controls['components'] as FormGroup);
    // Create component
    for (const componentIdentifier of Object.values(ComponentType)) {
      // Create controls
      this.components.addControl(componentIdentifier, new FormGroup({
        active: new FormControl(false),
        type: new FormControl(''),
      }));
    }
    // Load
    this.loadTenant();

    this.centralServerNotificationService.getSubjectTenant().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.tenantID) {
        this.loadTenant();
      }
    });
  }

  loadTenant() {
    if (this.tenantID) {
      this.spinnerService.show();
      this.centralServerService.getTenant(this.tenantID).subscribe((tenant) => {
        this.spinnerService.hide();
        if (tenant) {
          this.currentTenant = tenant;
          // Init
          this.id.setValue(this.currentTenant.id);
          this.name.setValue(this.currentTenant.name);
          this.email.setValue(this.currentTenant.email);
          this.subdomain.setValue(this.currentTenant.subdomain);
          // Add available components
          for (const componentIdentifier of Object.values(ComponentType)) {
            // Set the params
            if (this.currentTenant.components && this.currentTenant.components[componentIdentifier]) {
              // Get component group
              const component = this.components.controls[componentIdentifier] as FormGroup;
              // Set Active
              component.controls.active.setValue(
                this.currentTenant.components[componentIdentifier].active === true);
              // Set Type
              component.controls.type.setValue(
                this.currentTenant.components[componentIdentifier].type);
            }
          }
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
        this.dialogRef.close();
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  save(tenant: Tenant) {
    // Clear Type of inactive tenants
    let pricingActive = false;
    let refundActive = false;
    let billingActive = false;
    let smartChargingActive = false;
    let organizationActive = false;
    let buildingActive = false;

    for (const component in tenant.components) {
      if (tenant.components.hasOwnProperty(component)) {
        if (!tenant.components[component].active) {
          tenant.components[component].type = null;
        }
        if (component === ComponentType.PRICING) {
          pricingActive = tenant.components[component].active;
        }
        if (component === ComponentType.REFUND) {
          refundActive = tenant.components[component].active;
        }
        if (component === ComponentType.BILLING) {
          billingActive = tenant.components[component].active;
        }
        if (component === ComponentType.SMART_CHARGING) {
          smartChargingActive = tenant.components[component].active;
        }
        if (component === ComponentType.ORGANIZATION) {
          organizationActive = tenant.components[component].active;
        }
        if (component === ComponentType.BUILDING) {
          buildingActive = tenant.components[component].active;
        }
      }
    }
    if (refundActive && !pricingActive) {
      this.messageService.showErrorMessage('tenants.save_error_refund');
      return;
    }
    if (billingActive && !pricingActive) {
      this.messageService.showErrorMessage('tenants.save_error_billing');
      return;
    }
    if (smartChargingActive && !organizationActive) {
      this.messageService.showErrorMessage('tenants.save_error_smart_charging');
      return;
    }
    if (this.currentTenant) {
      // update existing tenant
      this.updateTenant(tenant);
    } else {
      // create new tenant
      this.createTenant(tenant);
    }
  }

  private createTenant(tenant: Tenant) {
    this.spinnerService.show();
    this.centralServerService.createTenant(tenant).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tenants.create_success', { name: tenant.name });
        this.dialogRef.close(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tenants.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.create_error');
    });
  }

  private updateTenant(tenant: Tenant) {
    this.spinnerService.show();
    this.centralServerService.updateTenant(tenant).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tenants.update_success', { name: tenant.name });
        this.dialogRef.close(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tenants.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.update_error');
    });
  }
}
