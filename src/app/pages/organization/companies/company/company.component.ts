import {mergeMap} from 'rxjs/operators';
import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material';

import {CentralServerService} from 'app/services/central-server.service';
import {SpinnerService} from 'app/services/spinner.service';
import {AuthorizationService} from 'app/services/authorization-service';
import {MessageService} from 'app/services/message.service';
import {ParentErrorStateMatcher} from 'app/utils/ParentStateMatcher';
import {DialogService} from 'app/services/dialog.service';
import {Constants} from 'app/utils/Constants';
import {Utils} from 'app/utils/Utils';

@Component({
  selector: 'app-company-cmp',
  templateUrl: 'company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentCompanyID: string;
  @Input() inDialog: boolean;
  @Input() dialogRef: MatDialogRef<any>;

  public isAdmin;
  public logo: any = Constants.COMPANY_NO_LOGO;

  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public address: FormGroup;
  public address1: AbstractControl;
  public address2: AbstractControl;
  public postalCode: AbstractControl;
  public city: AbstractControl;
  public department: AbstractControl;
  public region: AbstractControl;
  public country: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateCompany({'id': this.activatedRoute.snapshot.params['id']})) {
      // Not authorized
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'address': new FormGroup({
        'address1': new FormControl(''),
        'address2': new FormControl(''),
        'postalCode': new FormControl(''),
        'city': new FormControl(''),
        'department': new FormControl(''),
        'region': new FormControl(''),
        'country': new FormControl(''),
        'latitude': new FormControl('',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern('^-?([1-8]?[1-9]|[1-9]0)\.{0,1}[0-9]*$')
          ])),
        'longitude': new FormControl('',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern('^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{0,1}[0-9]*$')
          ]))
      })
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.address = <FormGroup>this.formGroup.controls['address'];
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.latitude = this.address.controls['latitude'];
    this.longitude = this.address.controls['longitude'];


    if (this.currentCompanyID) {
      this.loadCompany();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentCompanyID = params['id'];
        this.loadCompany();
      });
    }
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentCompanyId(currentCompanyId) {
    this.currentCompanyID = currentCompanyId;
  }

  public showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
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
      if (company.address && company.address.latitude) {
        this.address.controls.latitude.setValue(company.address.latitude);
      }
      if (company.address && company.address.longitude) {
        this.address.controls.longitude.setValue(company.address.longitude);
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

  public updateCompanyLogo(company) {
    // Check no company?
    if (!this.logo.endsWith(Constants.COMPANY_NO_LOGO)) {
      // Set to company
      company.logo = this.logo;
    } else {
      // No logo
      company.logo = null;
    }
  }

  public saveCompany(company) {
    if (this.currentCompanyID) {
      this._updateCompany(company);
    } else {
      this._createCompany(company);
    }
  }

  private _createCompany(company) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateCompanyLogo(company);
    // Yes: Update
    this.centralServerService.createCompany(company).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('companies.create_success',
          {'companyName': company.name});
        // Refresh
        this.currentCompanyID = company.id;
        this.closeDialog();
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

  private _updateCompany(company) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateCompanyLogo(company);
    // Yes: Update
    this.centralServerService.updateCompany(company).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('companies.update_success', {'companyName': company.name});
        this.closeDialog();
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'company.update_error');
      }
    });
  }

  public logoChanged(event) {
    // load picture
    let reader = new FileReader(); // tslint:disable-line
    const file = event.target.files[0];
    reader.onload = () => {
      this.logo = reader.result;
    };
    reader.readAsDataURL(file);
    this.formGroup.markAsDirty();
  }

  public clearLogo() {
    // Clear
    this.logo = Constants.COMPANY_NO_LOGO;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public closeDialog() {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }
}
