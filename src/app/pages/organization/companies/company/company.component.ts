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
import { CompaniesAuthorizations, DialogMode } from 'types/Authorization';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Company } from '../../../../types/Company';
import { RestResponse } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';
import { CompanyMainComponent } from './main/company-main.component';

@Component({
  selector: 'app-company',
  templateUrl: 'company.component.html',
  styleUrls: ['company.component.scss'],
})
export class CompanyComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentCompanyID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public companiesAuthorizations!: CompaniesAuthorizations;

  @ViewChild('companyMainComponent') public companyMainComponent!: CompanyMainComponent;
  @ViewChild('accountBillingComponent') public accountBillingComponent!: AccountBillingComponent;

  public formGroup!: UntypedFormGroup;
  public readOnly = true;
  public company: Company;
  public isBillingActive = false;
  public isBillingPlatformActive = false;
  public accountHasVisibleFields: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    protected windowService: WindowService,
    protected activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router
  ) {
    super(activatedRoute, windowService, ['main'], false);
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
    // Load Company
    this.loadCompany();
  }

  public loadCompany() {
    if (this.currentCompanyID) {
      this.spinnerService.show();
      this.centralServerService.getCompany(this.currentCompanyID).subscribe({
        next: (company: Company) => {
          this.spinnerService.hide();
          this.company = company;
          // Check if Account Data is to be displayed
          this.accountHasVisibleFields = company.projectFields.includes('accountData.accountID');
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
              this.messageService.showErrorMessage('companies.company_not_found');
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
      this.saveCompany.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveCompany(company: Company) {
    if (this.currentCompanyID) {
      this.updateCompany(company);
    } else {
      this.createCompany(company);
    }
  }

  private createCompany(company: Company) {
    this.spinnerService.show();
    // Set the logo
    this.companyMainComponent.updateCompanyLogo(company);
    // Set coordinates
    this.companyMainComponent.updateCompanyCoordinates(company);
    // Set connected account
    this.accountBillingComponent?.updateEntityConnectedAccount(company);
    // Create
    this.centralServerService.createCompany(company).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('companies.create_success', {
            companyName: company.name,
          });
          this.currentCompanyID = company.id;
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'companies.create_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('companies.company_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'companies.create_error'
            );
        }
      },
    });
  }

  private updateCompany(company: Company) {
    this.spinnerService.show();
    // Set the logo
    this.companyMainComponent.updateCompanyLogo(company);
    // Set coordinates
    this.companyMainComponent.updateCompanyCoordinates(company);
    // Set connected account
    this.accountBillingComponent?.updateEntityConnectedAccount(company);
    // Update
    this.centralServerService.updateCompany(company).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('companies.update_success', {
            companyName: company.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'companies.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('companies.company_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'companies.update_error'
            );
        }
      },
    });
  }
}
