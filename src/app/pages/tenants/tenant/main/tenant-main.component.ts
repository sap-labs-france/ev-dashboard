import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../../services/central-server.service';
import { ConfigService } from '../../../../services/config.service';
import { MessageService } from '../../../../services/message.service';
import { Address } from '../../../../types/Address';
import { Tenant } from '../../../../types/Tenant';
import { Constants } from '../../../../utils/Constants';

@Component({
  selector: 'app-tenant-main',
  templateUrl: 'tenant-main.component.html',
})
export class TenantMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public tenant!: Tenant;

  public initialized = false;

  public id!: AbstractControl;
  public name!: AbstractControl;
  public subdomain!: AbstractControl;
  public email!: AbstractControl;
  public components!: UntypedFormGroup;
  public logo = Constants.NO_IMAGE;
  public logoHasChanged = false;
  public logoMaxSize: number;
  public address!: Address;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService,
    private configService: ConfigService
  ) {
    this.logoMaxSize = this.configService.getTenant().maxLogoKb;
  }

  public ngOnInit() {
    // Init main part
    this.formGroup.addControl('id', new UntypedFormControl(''));
    this.formGroup.addControl(
      'name',
      new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      )
    );
    this.formGroup.addControl(
      'email',
      new UntypedFormControl('', Validators.compose([Validators.required, Validators.email]))
    );
    this.formGroup.addControl(
      'subdomain',
      new UntypedFormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[a-z0-9]+$'),
        ])
      )
    );
    // Assign
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.initialized = true;
    this.loadTenant();
  }

  public ngOnChanges() {
    this.loadTenant();
  }

  public loadTenant() {
    if (this.initialized && this.tenant) {
      // Init main part
      this.id.setValue(this.tenant.id);
      this.name.setValue(this.tenant.name);
      this.email.setValue(this.tenant.email);
      this.subdomain.setValue(this.tenant.subdomain);
      if (this.tenant.address) {
        this.address = this.tenant.address;
      }
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

  public onLogoChanged(event: any) {
    // Load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > this.logoMaxSize * 1024) {
        this.messageService.showErrorMessage('tenants.logo_size_error', {
          maxPictureKb: this.logoMaxSize,
        });
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
}
