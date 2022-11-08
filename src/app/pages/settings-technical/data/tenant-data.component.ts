import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../services/central-server.service';
import { ConfigService } from '../../../services/config.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Address } from '../../../types/Address';
import { RestResponse } from '../../../types/GlobalType';
import { Tenant } from '../../../types/Tenant';
import { TenantSupport } from '../../../types/TenantSupport';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-tenant-data',
  templateUrl: 'tenant-data.component.html',
})
export class TenantDataComponent implements OnInit, OnChanges {

  public isDisabled: boolean;
  public initialized = false;
  public formGroup!: UntypedFormGroup;
  public name!: AbstractControl;
  public legalStatus!: AbstractControl;
  public corporateName!: AbstractControl;
  public website!: AbstractControl;
  public email!: AbstractControl;
  public rcs!: AbstractControl;
  public capital!: AbstractControl;
  public siret!: AbstractControl;
  public logo = Constants.NO_IMAGE;
  public logoHasChanged = false;
  public logoMaxSize: number;
  public address: Address = {} as Address;
  public tenantSupport: TenantSupport = {} as TenantSupport;
  public tenant: Tenant;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService,
    private configService: ConfigService,
    private spinnerService: SpinnerService) {
    this.logoMaxSize = this.configService.getTenant().maxLogoKb;
    this.isDisabled = false;
  }

  public ngOnInit() {
    // Init main part
    this.formGroup = new UntypedFormGroup({});
    this.formGroup.addControl('name', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(100),
      ]))
    );
    this.formGroup.addControl('email', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
        Validators.email,
      ]))
    );
    this.formGroup.addControl('corporateName', new UntypedFormControl('',
      Validators.compose([
        Validators.maxLength(100),
      ]))
    );
    this.formGroup.addControl('website', new UntypedFormControl('',
      Validators.compose([
        Validators.pattern(Constants.URL_PATTERN)
      ]))
    );
    this.formGroup.addControl('rcs', new UntypedFormControl('',
      Validators.compose([
      ]))
    );
    this.formGroup.addControl('capital', new UntypedFormControl('',
      Validators.compose([
        Validators.pattern('^[0-9]*$')
      ]))
    );
    this.formGroup.addControl('siret', new UntypedFormControl('',
      Validators.compose([
        Validators.pattern('^[0-9]{14}$')
      ]))
    );
    this.formGroup.addControl('legalStatus', new UntypedFormControl('',
      Validators.compose([
      ]))
    );
    // Assign
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.legalStatus = this.formGroup.controls['legalStatus'];
    this.corporateName = this.formGroup.controls['corporateName'];
    this.website = this.formGroup.controls['website'];
    this.rcs = this.formGroup.controls['rcs'];
    this.capital = this.formGroup.controls['capital'];
    this.siret = this.formGroup.controls['siret'];
    this.initialized = true;
    this.loadTenant();
  }

  public ngOnChanges() {
    this.loadTenant();
  }

  public loadTenant() {
    // Init main part
    this.centralServerService.getTenant(this.centralServerService.getLoggedUser().tenantID).subscribe((tenant) => {
      this.name.setValue(tenant.name);
      this.email.setValue(tenant.email);
      this.legalStatus.setValue(tenant.legalStatus);
      this.corporateName.setValue(tenant.corporateName);
      this.website.setValue(tenant.website);
      this.rcs.setValue(tenant.rcs);
      this.capital.setValue(tenant.capital);
      this.siret.setValue(tenant.siret);
      if (tenant.address) {
        this.address = tenant.address;
      }
      if (tenant.support) {
        this.tenantSupport = tenant.support;
      }
      this.tenant = tenant;
      this.formGroup.markAsPristine();
      // Get Tenant logo
      this.centralServerService.getTenantLogo(this.tenant.id).subscribe({
        next: (tenantLogo) => {
          this.logo = tenantLogo ?? Constants.NO_IMAGE;
        },
        error: (error) => {
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.logo = Constants.NO_IMAGE;
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService,
                this.centralServerService, 'general.unexpected_error_backend');
          }
        }
      });
      // Update form group
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    });
  }

  public refresh(){
    this.loadTenant();
  }

  public onLogoChanged(event: any) {
    // Load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.logoMaxSize * 1024)) {
        this.messageService.showErrorMessage('tenants.logo_size_error', { maxPictureKb: this.logoMaxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.logo = reader.result as string;
          this.logoHasChanged = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  public clearLogo() {
    // Clear
    this.logo = Constants.NO_IMAGE;
    this.logoHasChanged = true;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public updateTenantLogo(tenant: Tenant) {
    if (this.logoHasChanged) {
      // Set new logo
      if (this.logo !== Constants.NO_IMAGE) {
        tenant.logo = this.logo;
      } else {
        tenant.logo = null;
      }
    } else {
      // No changes
      delete tenant.logo;
    }
  }

  public saveTenant(tenant: Tenant) {
    this.spinnerService.show();
    this.updateTenantLogo(tenant);
    tenant.id = this.centralServerService.getLoggedUser().tenantID;
    // forthis.tenantSupport
    this.centralServerService.updateTenantData(tenant).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tenants.update_success', { name: tenant.name });
          this.refresh();
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tenants.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.update_error');
      }
    });
  }
}
