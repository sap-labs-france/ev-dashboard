import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Company, CompanyLogo } from 'app/types/Company';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { Utils } from 'app/utils/Utils';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';

@Component({
  selector: 'app-company',
  templateUrl: 'company.component.html',
})
export class CompanyComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentCompanyID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;

  public isAdmin = false;
  public logo: string = CompanyLogo.NO_LOGO;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: FormArray;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router) {

    this.maxSize = this.configService.getCompany().maxLogoKb;

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateCompany()) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // get admin flag
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      address: new FormGroup({
        address1: new FormControl(''),
        address2: new FormControl(''),
        postalCode: new FormControl(''),
        city: new FormControl(''),
        department: new FormControl(''),
        region: new FormControl(''),
        country: new FormControl(''),
        coordinates: new FormArray ([
          new FormControl('',
            Validators.compose([
              Validators.max(180),
              Validators.min(-180),
              Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
            ])),
          new FormControl('',
            Validators.compose([
              Validators.max(90),
              Validators.min(-90),
              Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
            ])),
        ]),
      }),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;

    // if not admin switch in readonly mode
    if (!this.isAdmin) {
      this.formGroup.disable();
    }

    if (this.currentCompanyID) {
      this.loadCompany();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentCompanyID = params['id'];
        this.loadCompany();
      });
    }

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });

    this.centralServerNotificationService.getSubjectCompany().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.currentCompanyID) {
        this.loadCompany();
      }
    });
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentCompanyId(currentCompanyId: string) {
    this.currentCompanyID = currentCompanyId;
  }

  public refresh() {
    // Load Company
    this.loadCompany();
  }

  public loadCompany() {
    if (!this.currentCompanyID) {
      return;
    }

    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getCompany(this.currentCompanyID).pipe(mergeMap((company) => {
      this.formGroup.markAsPristine();
      // Init form
      if (company.id) {
        this.formGroup.controls.id.setValue(company.id);
      }
      if (company.name) {
        this.formGroup.controls.name.setValue(company.name);
      }
      if (company.address && company.address.address1) {
        this.address.controls.address1.setValue(company.address.address1);
      }
      if (company.address && company.address.address2) {
        this.address.controls.address2.setValue(company.address.address2);
      }
      if (company.address && company.address.postalCode) {
        this.address.controls.postalCode.setValue(company.address.postalCode);
      }
      if (company.address && company.address.city) {
        this.address.controls.city.setValue(company.address.city);
      }
      if (company.address && company.address.department) {
        this.address.controls.department.setValue(company.address.department);
      }
      if (company.address && company.address.region) {
        this.address.controls.region.setValue(company.address.region);
      }
      if (company.address && company.address.country) {
        this.address.controls.country.setValue(company.address.country);
      }
      if (company.address && company.address.coordinates && company.address.coordinates.length === 2) {
        this.coordinates.at(0).setValue(company.address.coordinates[0]);
        this.coordinates.at(1).setValue(company.address.coordinates[1]);
      }
      // Yes, get logo
      return this.centralServerService.getCompanyLogo(this.currentCompanyID);
    })).subscribe((companyLogo) => {
      if (companyLogo && companyLogo.logo) {
        this.logo = companyLogo.logo.toString();
      }
      this.spinnerService.hide();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'companies.company_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateCompanyLogo(company: Company) {
    // Check no company?
    if (!this.logo.endsWith(CompanyLogo.NO_LOGO)) {
      // Set to company
      company.logo = this.logo;
    } else {
      // No logo
      delete company.logo;
    }
  }

  public saveCompany(company: Company) {
    if (this.currentCompanyID) {
      this.updateCompany(company);
    } else {
      this.createCompany(company);
    }
  }

  public logoChanged(event: any) {
    // load picture
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('companies.logo_size_error', {maxPictureKb: this.maxSize});
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.logo = reader.result as string;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearLogo() {
    // Clear
    this.logo = CompanyLogo.NO_LOGO;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.SAVE_AND_CLOSE) {
          this.saveCompany(this.formGroup.value);
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private createCompany(company: Company) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateCompanyLogo(company);
    // Yes: Update
    this.centralServerService.createCompany(company).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('companies.create_success',
          { companyName: company.name });
        // Refresh
        this.currentCompanyID = company.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'companies.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Company deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('companies.company_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'companies.create_error');
      }
    });
  }

  private updateCompany(company: Company) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateCompanyLogo(company);
    // Yes: Update
    this.centralServerService.updateCompany(company).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('companies.update_success', { companyName: company.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'companies.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Company deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('companies.company_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'companies.update_error');
      }
    });
  }
}
