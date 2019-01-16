import {mergeMap} from 'rxjs/operators';
import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {Address} from 'ngx-google-places-autocomplete/objects/address';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MessageService} from '../../../services/message.service';
import {ParentErrorStateMatcher} from '../../../utils/ParentStateMatcher';
import {DialogService} from '../../../services/dialog.service';
import {Constants} from '../../../utils/Constants';
import {Users} from '../../../utils/Users';
import {Utils} from '../../../utils/Utils';
import {UserRoles, userStatuses} from '../users.model';
import {DOCUMENT} from '@angular/common';
import {ActionResponse} from '../../../common.types';

@Component({
  selector: 'app-user-cmp',
  templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentUserID: string;
  @Input() inDialog: boolean;
  public userStatuses;
  public userRoles;
  public userLocales;
  public isAdmin;
  public originalEmail;
  public image = Constants.USER_NO_PICTURE;
  public hideRepeatPassword = true;
  public hidePassword = true;

  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public firstName: AbstractControl;
  public email: AbstractControl;
  public phone: AbstractControl;
  public mobile: AbstractControl;
  public iNumber: AbstractControl;
  public tagIDs: AbstractControl;
  public costCenter: AbstractControl;
  public status: AbstractControl;
  public role: AbstractControl;
  public locale: AbstractControl;
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
  public chargeAtHomeSetting: any;
  public integrationConnections: any;

  public passwords: FormGroup;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private localeService: LocaleService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router,
    @Inject(DOCUMENT) private document: any) {

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateUser({'id': this.activatedRoute.snapshot.params['id']})) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get statuses
    this.userStatuses = userStatuses;
    // Get Roles
    this.userRoles = UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role);
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    console.log(this.activatedRoute.snapshot.queryParams);
    if (this.activatedRoute.snapshot.queryParams['state']) {
      const state = JSON.parse(this.activatedRoute.snapshot.queryParams['state']);
      if (state.connector === 'concur') {
        this._createConcurConnection(state);
      }
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
      'firstName': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'email': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email
        ])),
      'phone': new FormControl('',
        Validators.compose([
          Validators.pattern('^\\+?([0-9] ?){9,14}[0-9]$')
        ])),
      'mobile': new FormControl('',
        Validators.compose([
          Validators.pattern('^\\+?([0-9] ?){9,14}[0-9]$')
        ])),
      'iNumber': new FormControl('',
        Validators.compose([
          Validators.pattern('^[A-Z]{1}[0-9]{6}$')
        ])),
      'tagIDs': new FormControl('',
        Validators.compose([
          Validators.pattern('^[a-zA-Z0-9,]*$')
        ])),
      'costCenter': new FormControl('',
        Validators.compose([
          Validators.pattern('^[0-9]*$')
        ])),
      'status': new FormControl(Constants.USER_STATUS_ACTIVE,
        Validators.compose([
          Validators.required
        ])),
      'role': new FormControl(Constants.USER_ROLE_BASIC,
        Validators.compose([
          Validators.required
        ])),
      'locale': new FormControl(this.localeService.getCurrentFullLocale(),
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
      }),
      'passwords': new FormGroup({
        'password': new FormControl('',
          Validators.compose([
            Users.passwordWithNoSpace,
            Users.validatePassword
          ])),
        'repeatPassword': new FormControl('',
          Validators.compose([
            Users.validatePassword
          ])),
      }, (passwordFormGroup: FormGroup) => {
        return Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword');
      })
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.firstName = this.formGroup.controls['firstName'];
    this.email = this.formGroup.controls['email'];
    this.phone = this.formGroup.controls['phone'];
    this.mobile = this.formGroup.controls['mobile'];
    this.iNumber = this.formGroup.controls['iNumber'];
    this.tagIDs = this.formGroup.controls['tagIDs'];
    this.costCenter = this.formGroup.controls['costCenter'];
    this.status = this.formGroup.controls['status'];
    this.role = this.formGroup.controls['role'];
    this.locale = this.formGroup.controls['locale'];
    this.passwords = <FormGroup>this.formGroup.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
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

    if (this.currentUserID) {
      this.loadUser();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentUserID = params['id'];
        this.loadUser();
      });
    }

    this.loadApplicationSettings();
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }

  public setCurrentUserId(currentUserId) {
    this.currentUserID = currentUserId;
  }

  public setAddress(address: Address) {
    // Set data
    address.address_components.forEach(((address_component) => {
      switch (address_component.types[0]) {
        // Postal Code
        case 'postal_code':
          this.address.controls.postalCode.setValue(address_component.long_name);
          break;
        // Town
        case 'locality':
          this.address.controls.city.setValue(address_component.long_name);
          break;
        // Department
        case 'administrative_area_level_2':
          this.address.controls.department.setValue(address_component.long_name);
          break;
        // Region
        case 'administrative_area_level_1':
          this.address.controls.region.setValue(address_component.long_name);
          break;
        // Country
        case 'country':
          this.address.controls.country.setValue(address_component.long_name);
          break;
      }
    }));
    // Address
    this.address.controls.address1.setValue(address.name);
    // Latitude
    this.address.controls.latitude.setValue(address.geometry.location.lat());
    // Longitude
    this.address.controls.longitude.setValue(address.geometry.location.lng());
  }

  public showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
  }

  public refresh() {
    // Load User
    this.loadUser();
  }

  public loadUser() {
    if (!this.currentUserID) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getUser(this.currentUserID).pipe(mergeMap((user) => {
      this.formGroup.markAsPristine();
      // Init form
      if (user.id) {
        this.formGroup.controls.id.setValue(user.id);
      }
      if (user.name) {
        this.formGroup.controls.name.setValue(user.name);
      }
      if (user.firstName) {
        this.formGroup.controls.firstName.setValue(user.firstName);
      }
      if (user.email) {
        this.formGroup.controls.email.setValue(user.email);
        this.originalEmail = user.email;
      }
      if (user.phone) {
        this.formGroup.controls.phone.setValue(user.phone);
      }
      if (user.mobile) {
        this.formGroup.controls.mobile.setValue(user.mobile);
      }
      if (user.iNumber) {
        this.formGroup.controls.iNumber.setValue(user.iNumber);
      }
      if (user.costCenter) {
        this.formGroup.controls.costCenter.setValue(user.costCenter);
      }
      if (user.status) {
        this.formGroup.controls.status.setValue(user.status);
      }
      if (user.role) {
        this.formGroup.controls.role.setValue(user.role);
      }
      if (user.locale) {
        this.formGroup.controls.locale.setValue(user.locale);
      }
      if (user.tagIDs) {
        this.formGroup.controls.tagIDs.setValue(user.tagIDs);
      }
      if (user.address && user.address.address1) {
        this.address.controls.address1.setValue(user.address.address1);
      }
      if (user.address && user.address.address2) {
        this.address.controls.address2.setValue(user.address.address2);
      }
      if (user.address && user.address.postalCode) {
        this.address.controls.postalCode.setValue(user.address.postalCode);
      }
      if (user.address && user.address.city) {
        this.address.controls.city.setValue(user.address.city);
      }
      if (user.address && user.address.department) {
        this.address.controls.department.setValue(user.address.department);
      }
      if (user.address && user.address.region) {
        this.address.controls.region.setValue(user.address.region);
      }
      if (user.address && user.address.country) {
        this.address.controls.country.setValue(user.address.country);
      }
      if (user.address && user.address.latitude) {
        this.address.controls.latitude.setValue(user.address.latitude);
      }
      if (user.address && user.address.longitude) {
        this.address.controls.longitude.setValue(user.address.longitude);
      }
      // Reset password
      this.passwords.controls.password.setValue('');
      this.passwords.controls.repeatPassword.setValue('');
      // Yes, get image
      return this.centralServerService.getUserImage(this.currentUserID);
    })).subscribe((userImage) => {
      if (userImage && userImage.image) {
        this.image = userImage.image.toString();
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.user_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateUserImage(user) {
    // Set the image
    this.image = jQuery('.fileinput-preview img')[0]['src'];
    // Check no user?
    if (!this.image.endsWith(Constants.USER_NO_PICTURE)) {
      // Set to user
      user.image = this.image;
    } else {
      // No image
      user.image = null;
    }
  }

  public saveUser(user) {
    if (this.currentUserID) {
      this._updateUser(user);
    } else {
      this._createUser(user);
    }
  }

  public imageChanged() {
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public clearImage() {
    // Clear
    jQuery('.fileinput-preview img')[0]['src'] = Constants.USER_NO_PICTURE;
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  private loadApplicationSettings() {
    this.centralServerService.getSettings(Constants.SETTINGS_CHARGE_AT_HOME).subscribe(settingResult => {
      if (settingResult && settingResult.result && settingResult.result.length > 0) {
        this.chargeAtHomeSetting = settingResult.result[0];
      }
    });
    this.centralServerService.getIntegrationConnections(this.currentUserID).subscribe(connectionResult => {
      if (connectionResult && connectionResult.result && connectionResult.result.length > 0) {
        this.integrationConnections = connectionResult.result;
      }
    });
  }

  linkConcurAccount() {
    if (this.chargeAtHomeSetting && this.chargeAtHomeSetting.content && this.chargeAtHomeSetting.content.concur) {
      const concurSetting = this.chargeAtHomeSetting.content.concur;
      // const returnedUrl = `${this.document.location.origin}/users/${this.currentUserID}`;
      const returnedUrl = 'https://slfcah.cfapps.eu10.hana.ondemand.com';
      const state = {
        connector: 'concur',
        appId: this.chargeAtHomeSetting.id,
        userId: this.currentUserID
      };
      this.document.location.href = `${concurSetting.url}/oauth2/v0/authorize?client_id=${concurSetting.clientId}&response_type=code&scope=EXPRPT&redirect_uri=${returnedUrl}&state=${JSON.stringify(state)}`;
    }
  }

  private _createConcurConnection(state) {
    if (this.activatedRoute.snapshot.queryParams['code']) {
      const payload = {
          settingId: state.appId,
          userId: state.userId,
          connectorId: 'concur',
          data:
            {
              code: this.activatedRoute.snapshot.queryParams['code'],
              redirectUri: 'https://slfcah.cfapps.eu10.hana.ondemand.com'
            }
        }
      ;
      console.log('createConnectorConnection');
      this.centralServerService.createIntegrationConnection(payload).subscribe((response: ActionResponse) => {
          console.log(response);
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            // Ok
            this.messageService.showSuccessMessage('settings.chargeathome.concur.link_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.chargeathome.concur.link_error');
          }
        }, (error) => {
          Utils.handleError(JSON.stringify(error),
            this.messageService, 'settings.chargeathome.concur.link_error');
        }
      );
    } else if (this.activatedRoute.snapshot.queryParams['error']) {
      Utils.handleError(this.activatedRoute.snapshot.queryParams['error'],
        this.messageService, 'settings.chargeathome.concur.link_error');
    }
  }

  private _createUser(user) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateUserImage(user);
    // Yes: Update
    this.centralServerService.createUser(user).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('users.create_success',
          {'userFullName': user.firstName + ' ' + user.name});
        // Refresh
        this.currentUserID = user.id;
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'users.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case 510:
          // Show error
          this.messageService.showErrorMessage('authentication.email_already_exists');
          break;
        // User deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.create_error');
      }
    });
  }

  private _updateUser(user) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateUserImage(user);
    // Yes: Update
    this.centralServerService.updateUser(user).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('users.update_success', {'userFullName': user.firstName + ' ' + user.name});
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'users.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case 510:
          // Show error
          this.messageService.showErrorMessage('authentication.email_already_exists');
          break;
        // User deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
      }
    });
  }
}
