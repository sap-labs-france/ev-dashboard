import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../../../services/central-server.service';
import { ConfigService } from '../../../../../services/config.service';
import { MessageService } from '../../../../../services/message.service';
import { Address } from '../../../../../types/Address';
import { Company } from '../../../../../types/Company';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-company-main',
  templateUrl: 'company-main.component.html',
})
export class CompanyMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public company!: Company;
  @Input() public readOnly: boolean;

  public logo = Constants.NO_IMAGE;
  public logoChanged = false;
  public maxSize: number;
  public initialized = false;

  public issuer!: AbstractControl;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public address!: Address;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private configService: ConfigService,
    private router: Router
  ) {
    this.maxSize = this.configService.getCompany().maxLogoKb;
  }

  public ngOnInit() {
    this.formGroup.addControl('issuer', new UntypedFormControl(true));
    this.formGroup.addControl('id', new UntypedFormControl(''));
    this.formGroup.addControl(
      'name',
      new UntypedFormControl('', Validators.compose([Validators.required]))
    );
    // Form
    this.issuer = this.formGroup.controls['issuer'];
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.initialized = true;
    this.loadCompany();
  }

  public ngOnChanges() {
    this.loadCompany();
  }

  public loadCompany() {
    if (this.initialized && this.company) {
      if (Utils.objectHasProperty(this.company, 'issuer')) {
        this.issuer.setValue(this.company.issuer);
      }
      if (this.company.id) {
        this.id.setValue(this.company.id);
      }
      if (this.company.name) {
        this.name.setValue(this.company.name);
      }
      if (this.company.address) {
        this.address = this.company.address;
      }
      // Get Company logo
      if (!this.logoChanged) {
        this.centralServerService.getCompanyLogo(this.company.id).subscribe({
          next: (companyLogo) => {
            this.logoChanged = true;
            this.logo = companyLogo ?? Constants.NO_IMAGE;
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
  }

  public updateCompanyLogo(company: Company) {
    if (this.logo !== Constants.NO_IMAGE) {
      company.logo = this.logo;
    } else {
      company.logo = null;
    }
  }

  public updateCompanyCoordinates(company: Company) {
    if (
      company.address &&
      company.address.coordinates &&
      !(company.address.coordinates[0] || company.address.coordinates[1])
    ) {
      delete company.address.coordinates;
    }
  }

  public onLogoChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > this.maxSize * 1024) {
        this.messageService.showErrorMessage('companies.logo_size_error', {
          maxPictureKb: this.maxSize,
        });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.logo = reader.result as string;
          this.logoChanged = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearLogo() {
    // Clear
    this.logo = Constants.NO_IMAGE;
    this.logoChanged = true;
    this.formGroup.markAsDirty();
  }
}
