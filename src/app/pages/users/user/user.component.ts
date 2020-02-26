import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationConnection } from 'app/types/Connection';
import { ActionResponse } from 'app/types/DataResult';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { PricingSettingsType, RefundSettings } from 'app/types/Setting';
import { ButtonType } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { User, UserRole, UserStatus } from 'app/types/User';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { ConfigService } from '../../../services/config.service';
import { DialogService } from '../../../services/dialog.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AbstractTabComponent } from '../../../shared/component/abstract-tab/abstract-tab.component';
import { Constants } from '../../../utils/Constants';
import { ParentErrorStateMatcher } from '../../../utils/ParentStateMatcher';
import { Users } from '../../../utils/Users';
import { Utils } from '../../../utils/Utils';
import { UserRoles, userStatuses } from '../model/users.model';
import { UserTagsTableDataSource } from './user-tags-table-data-source';
import { UserDialogComponent } from './user.dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  providers: [UserTagsTableDataSource],
})
export class UserComponent extends AbstractTabComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentUserID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<UserDialogComponent>;
  public userStatuses: KeyValue[];
  public userRoles: KeyValue[];
  public userLocales: KeyValue[];
  public isAdmin = false;
  public isSuperAdmin = false;
  public isSiteAdmin = false;
  public originalEmail!: string;
  public image = Constants.USER_NO_PICTURE;
  public hideRepeatPassword = true;
  public hidePassword = true;
  public maxSize: number;
  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public issuer!: AbstractControl;
  public name!: AbstractControl;
  public firstName!: AbstractControl;
  public email!: AbstractControl;
  public phone!: AbstractControl;
  public mobile!: AbstractControl;
  public iNumber!: AbstractControl;
  public tags!: FormArray;
  public plateID!: AbstractControl;
  public costCenter!: AbstractControl;
  public status!: AbstractControl;
  public role!: AbstractControl;
  public locale!: AbstractControl;
  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public latitude!: AbstractControl;
  public longitude!: AbstractControl;
  public refundSetting!: RefundSettings;
  public integrationConnections!: IntegrationConnection[];
  public concurConnection!: IntegrationConnection;
  public passwords!: FormGroup;
  public password!: AbstractControl;
  public repeatPassword!: AbstractControl;
  public notificationsActive!: AbstractControl;
  public notifications!: FormGroup;
  public sendSessionStarted!: AbstractControl;
  public sendOptimalChargeReached!: AbstractControl;
  public sendCarSynchronizationFailed!: AbstractControl;
  public sendEndOfCharge!: AbstractControl;
  public sendEndOfSession!: AbstractControl;
  public sendUserAccountStatusChanged!: AbstractControl;
  public sendUnknownUserBadged!: AbstractControl;
  public sendChargingStationStatusError!: AbstractControl;
  public sendChargingStationRegistered!: AbstractControl;
  public sendOfflineChargingStations!: AbstractControl;
  public sendOcpiPatchStatusError!: AbstractControl;
  public sendPreparingSessionNotStarted!: AbstractControl;
  public sendSmtpAuthError!: AbstractControl;
  public sendBillingUserSynchronizationFailed!: AbstractControl;
  public sendSessionNotStarted!: AbstractControl;
  public sendUserAccountInactivity!: AbstractControl;
  public user!: User;
  public isConcurConnectionValid!: boolean;
  public canSeeInvoice: boolean;
  private currentLocale!: string;

  constructor(
    private userTagsTableDataSource: UserTagsTableDataSource,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private localeService: LocaleService,
    private configService: ConfigService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    @Inject(DOCUMENT) private document: any,
    activatedRoute: ActivatedRoute,
    windowService: WindowService) {
    super(activatedRoute, windowService, ['common', 'address', 'password', 'connectors', 'notifications', 'miscs'], false);

    this.maxSize = this.configService.getUser().maxPictureKb;

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateUser()) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get statuses
    this.userStatuses = userStatuses;
    // Get Roles
    // @ts-ignore
    this.userRoles = UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role);
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currentLocale = locale.currentLocale;
    });
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();

    this.canSeeInvoice = false;
    this.componentService.getPricingSettings().subscribe((settings) => {
      if (settings && settings.type === PricingSettingsType.CONVERGENT_CHARGING) {
        this.canSeeInvoice = true;
      }
    });
  }

  updateRoute(event: number) {
    if (!this.inDialog) {
      super.updateRoute(event);
    }
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      issuer: new FormControl(true),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      firstName: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      notificationsActive: new FormControl(true),
      notifications: new FormGroup({
        sendSessionStarted: new FormControl(true),
        sendOptimalChargeReached: new FormControl(true),
        sendCarSynchronizationFailed: new FormControl(true),
        sendEndOfCharge: new FormControl(true),
        sendEndOfSession: new FormControl(true),
        sendUserAccountStatusChanged: new FormControl(true),
        sendSessionNotStarted: new FormControl(true),
        sendUserAccountInactivity: new FormControl(true),
        // Admin notifs
        sendUnknownUserBadged: new FormControl(false),
        sendChargingStationStatusError: new FormControl(false),
        sendChargingStationRegistered: new FormControl(false),
        sendOfflineChargingStations: new FormControl(false),
        sendPreparingSessionNotStarted: new FormControl(false),
        sendOcpiPatchStatusError: new FormControl(false),
        sendSmtpAuthError: new FormControl(false),
        sendBillingUserSynchronizationFailed: new FormControl(false),
      }),
      email: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
        ])),
      phone: new FormControl('',
        Validators.compose([
          Users.validatePhone
        ])),
      mobile: new FormControl('',
        Validators.compose([
          Users.validatePhone
        ])),
      iNumber: new FormControl('',
        Validators.compose([
          Validators.pattern('^[A-Z]{1}[0-9]{6}$'),
        ])),
      tags: new FormArray([],
        Validators.compose(this.isSuperAdmin ? [] : [ Validators.required ])),
      plateID: new FormControl('',
        Validators.compose([
          Validators.pattern('^[A-Z0-9-]*$'),
        ])),
      costCenter: new FormControl('',
        Validators.compose([
          Validators.pattern('^[0-9]*$'),
        ])),
      status: new FormControl(UserStatus.ACTIVE,
        Validators.compose([
          Validators.required,
        ])),
      role: new FormControl(
        this.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.BASIC,
        Validators.compose([
          Validators.required,
        ])),
      locale: new FormControl(this.currentLocale,
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
        latitude: new FormControl('',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
          ])),
        longitude: new FormControl('',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
          ])),
      }),
      passwords: new FormGroup({
        password: new FormControl('',
          Validators.compose([
            Users.passwordWithNoSpace,
            Users.validatePassword,
          ])),
        repeatPassword: new FormControl('',
          Validators.compose([
            Users.validatePassword,
          ])),
      // @ts-ignore
      }, (passwordFormGroup: FormGroup) => {
        return Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword');
      }),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.issuer = this.formGroup.controls['issuer'];
    this.name = this.formGroup.controls['name'];
    this.firstName = this.formGroup.controls['firstName'];
    this.email = this.formGroup.controls['email'];
    this.phone = this.formGroup.controls['phone'];
    this.mobile = this.formGroup.controls['mobile'];
    this.iNumber = this.formGroup.controls['iNumber'];
    this.tags = this.formGroup.controls['tags'] as FormArray;
    this.plateID = this.formGroup.controls['plateID'];
    this.costCenter = this.formGroup.controls['costCenter'];
    this.status = this.formGroup.controls['status'];
    this.role = this.formGroup.controls['role'];
    this.locale = this.formGroup.controls['locale'];
    this.passwords = (this.formGroup.controls['passwords'] as FormGroup);
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.latitude = this.address.controls['latitude'];
    this.longitude = this.address.controls['longitude'];
    this.notificationsActive = this.formGroup.controls['notificationsActive'];
    this.notifications = this.formGroup.controls['notifications'] as FormGroup;
    this.sendSessionStarted = this.notifications.controls['sendSessionStarted'];
    this.sendOptimalChargeReached = this.notifications.controls['sendOptimalChargeReached'];
    this.sendCarSynchronizationFailed = this.notifications.controls['sendCarSynchronizationFailed'];
    this.sendEndOfCharge = this.notifications.controls['sendEndOfCharge'];
    this.sendEndOfSession = this.notifications.controls['sendEndOfSession'];
    this.sendUserAccountStatusChanged = this.notifications.controls['sendUserAccountStatusChanged'];
    this.sendUnknownUserBadged = this.notifications.controls['sendUnknownUserBadged'];
    this.sendChargingStationStatusError = this.notifications.controls['sendChargingStationStatusError'];
    this.sendChargingStationRegistered = this.notifications.controls['sendChargingStationRegistered'];
    this.sendOfflineChargingStations = this.notifications.controls['sendOfflineChargingStations'];
    this.sendOcpiPatchStatusError = this.notifications.controls['sendOcpiPatchStatusError'];
    this.sendPreparingSessionNotStarted = this.notifications.controls['sendPreparingSessionNotStarted'];
    this.sendSmtpAuthError = this.notifications.controls['sendSmtpAuthError'];
    this.sendBillingUserSynchronizationFailed = this.notifications.controls['sendBillingUserSynchronizationFailed'];
    this.sendSessionNotStarted = this.notifications.controls['sendSessionNotStarted'];
    this.sendUserAccountInactivity = this.notifications.controls['sendUserAccountInactivity'];
    this.userTagsTableDataSource.setFormArray(this.tags);
    if (this.currentUserID) {
      this.loadUser();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentUserID = params['id'];
        this.loadUser();
      });
    }
    if (!this.currentUserID) {
      // Create default badge
      this.userTagsTableDataSource.setContent([this.userTagsTableDataSource.createRow()]);
    }
    this.centralServerNotificationService.getSubjectUser().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.currentUserID) {
        this.loadUser();
      }
    });
    this.loadApplicationSettings();
    if (!this.inDialog) {
      super.enableRoutingSynchronization();
    }
  }

  public toggleNotificationsActive() {
    // reset notifications ?
  }

  public setCurrentUserId(currentUserID: string) {
    this.currentUserID = currentUserID;
  }

  // Google Address
  public setAddress(address: Address) {
    // Set data
    // tslint:disable-next-line: no-unsafe-any variable-name
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
    this.spinnerService.show();
    // tslint:disable-next-line: cyclomatic-complexity
    this.centralServerService.getUser(this.currentUserID).pipe(mergeMap((user) => {
      this.formGroup.markAsPristine();
      this.user = user;
      // Init form
      if (user.id) {
        this.formGroup.controls.id.setValue(user.id);
      }
      this.formGroup.controls.issuer.setValue(user.issuer);
      if (user.name) {
        this.formGroup.controls.name.setValue(user.name.toUpperCase());
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
      if (user.plateID) {
        this.formGroup.controls.plateID.setValue(user.plateID);
      }
      if (user.tags) {
        this.userTagsTableDataSource.setContent(user.tags);
      }
      if (user.hasOwnProperty('notificationsActive')) {
        this.formGroup.controls.notificationsActive.setValue(user.notificationsActive);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendSessionStarted')) {
        this.notifications.controls.sendSessionStarted.setValue(user.notifications.sendSessionStarted);
      } else {
        this.notifications.controls.sendSessionStarted.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendOptimalChargeReached')) {
        this.notifications.controls.sendOptimalChargeReached.setValue(user.notifications.sendOptimalChargeReached);
      } else {
        this.notifications.controls.sendOptimalChargeReached.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendCarSynchronizationFailed')) {
        this.notifications.controls.sendCarSynchronizationFailed.setValue(user.notifications.sendCarSynchronizationFailed);
      } else {
        this.notifications.controls.sendCarSynchronizationFailed.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendEndOfCharge')) {
        this.notifications.controls.sendEndOfCharge.setValue(user.notifications.sendEndOfCharge);
      } else {
        this.notifications.controls.sendEndOfCharge.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendEndOfSession')) {
        this.notifications.controls.sendEndOfSession.setValue(user.notifications.sendEndOfSession);
      } else {
        this.notifications.controls.sendEndOfSession.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendUserAccountStatusChanged')) {
        this.notifications.controls.sendUserAccountStatusChanged.setValue(user.notifications.sendUserAccountStatusChanged);
      } else {
        this.notifications.controls.sendUserAccountStatusChanged.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendUnknownUserBadged')) {
        this.notifications.controls.sendUnknownUserBadged.setValue(user.notifications.sendUnknownUserBadged);
      } else {
        this.notifications.controls.sendUnknownUserBadged.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendChargingStationStatusError')) {
        this.notifications.controls.sendChargingStationStatusError.setValue(user.notifications.sendChargingStationStatusError);
      } else {
        this.notifications.controls.sendChargingStationStatusError.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendChargingStationRegistered')) {
        this.notifications.controls.sendChargingStationRegistered.setValue(user.notifications.sendChargingStationRegistered);
      } else {
        this.notifications.controls.sendChargingStationRegistered.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendOfflineChargingStations')) {
        this.notifications.controls.sendOfflineChargingStations.setValue(user.notifications.sendOfflineChargingStations);
      } else {
        this.notifications.controls.sendOfflineChargingStations.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendOcpiPatchStatusError')) {
        this.notifications.controls.sendOcpiPatchStatusError.setValue(user.notifications.sendOcpiPatchStatusError);
      } else {
        this.notifications.controls.sendOcpiPatchStatusError.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendPreparingSessionNotStarted')) {
        this.notifications.controls.sendPreparingSessionNotStarted.setValue(user.notifications.sendPreparingSessionNotStarted);
      } else {
        this.notifications.controls.sendPreparingSessionNotStarted.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendSmtpAuthError')) {
        this.notifications.controls.sendSmtpAuthError.setValue(user.notifications.sendSmtpAuthError);
      } else {
        this.notifications.controls.sendSmtpAuthError.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendBillingUserSynchronizationFailed')) {
        this.notifications.controls.sendBillingUserSynchronizationFailed.setValue(user.notifications.sendBillingUserSynchronizationFailed);
      } else {
        this.notifications.controls.sendBillingUserSynchronizationFailed.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendUserAccountInactivity')) {
        this.notifications.controls.sendUserAccountInactivity.setValue(user.notifications.sendUserAccountInactivity);
      } else {
        this.notifications.controls.sendUserAccountInactivity.setValue(false);
      }
      if (user.notifications && user.notifications.hasOwnProperty('sendSessionNotStarted')) {
        this.notifications.controls.sendSessionNotStarted.setValue(user.notifications.sendSessionNotStarted);
      } else {
        this.notifications.controls.sendSessionNotStarted.setValue(false);
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
      if (user.address && user.address.coordinates && user.address.coordinates.length === 2) {
        this.address.controls.longitude.setValue(user.address.coordinates[0]);
        this.address.controls.latitude.setValue(user.address.coordinates[1]);
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
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
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

  public roleChanged(role: UserRoles) {
    switch (role) {
      case UserRole.ADMIN:
        this.formGroup.controls.notificationsActive.setValue(true);
        this.notifications.controls.sendSessionStarted.setValue(true);
        this.notifications.controls.sendOptimalChargeReached.setValue(true);
        this.notifications.controls.sendEndOfCharge.setValue(true);
        this.notifications.controls.sendEndOfSession.setValue(true);
        this.notifications.controls.sendUserAccountStatusChanged.setValue(true);
        this.notifications.controls.sendSessionNotStarted.setValue(true);
        this.notifications.controls.sendUserAccountInactivity.setValue(true);
        // Admin notifs
        this.notifications.controls.sendUnknownUserBadged.setValue(true);
        this.notifications.controls.sendChargingStationStatusError.setValue(true);
        this.notifications.controls.sendChargingStationRegistered.setValue(true);
        this.notifications.controls.sendOfflineChargingStations.setValue(true);
        this.notifications.controls.sendOcpiPatchStatusError.setValue(true);
        this.notifications.controls.sendPreparingSessionNotStarted.setValue(true);
        this.notifications.controls.sendSmtpAuthError.setValue(true);
        this.notifications.controls.sendBillingUserSynchronizationFailed.setValue(true);
        break;
      case UserRole.BASIC:
        this.formGroup.controls.notificationsActive.setValue(true);
        this.notifications.controls.sendSessionStarted.setValue(true);
        this.notifications.controls.sendOptimalChargeReached.setValue(true);
        this.notifications.controls.sendEndOfCharge.setValue(true);
        this.notifications.controls.sendEndOfSession.setValue(true);
        this.notifications.controls.sendUserAccountStatusChanged.setValue(true);
        this.notifications.controls.sendSessionNotStarted.setValue(true);
        this.notifications.controls.sendUserAccountInactivity.setValue(true);
        // Admin notifs
        this.notifications.controls.sendUnknownUserBadged.setValue(false);
        this.notifications.controls.sendChargingStationStatusError.setValue(false);
        this.notifications.controls.sendChargingStationRegistered.setValue(false);
        this.notifications.controls.sendOfflineChargingStations.setValue(false);
        this.notifications.controls.sendOcpiPatchStatusError.setValue(false);
        this.notifications.controls.sendPreparingSessionNotStarted.setValue(false);
        this.notifications.controls.sendSmtpAuthError.setValue(false);
        this.notifications.controls.sendBillingUserSynchronizationFailed.setValue(false);
        break;
      case UserRole.DEMO:
        this.formGroup.controls.notificationsActive.setValue(false);
        this.notifications.controls.sendSessionStarted.setValue(false);
        this.notifications.controls.sendOptimalChargeReached.setValue(false);
        this.notifications.controls.sendEndOfCharge.setValue(false);
        this.notifications.controls.sendEndOfSession.setValue(false);
        this.notifications.controls.sendUserAccountStatusChanged.setValue(false);
        this.notifications.controls.sendSessionNotStarted.setValue(false);
        this.notifications.controls.sendUserAccountInactivity.setValue(false);
        // Admin notifs
        this.notifications.controls.sendUnknownUserBadged.setValue(false);
        this.notifications.controls.sendChargingStationStatusError.setValue(false);
        this.notifications.controls.sendChargingStationRegistered.setValue(false);
        this.notifications.controls.sendOfflineChargingStations.setValue(false);
        this.notifications.controls.sendOcpiPatchStatusError.setValue(false);
        this.notifications.controls.sendPreparingSessionNotStarted.setValue(false);
        this.notifications.controls.sendSmtpAuthError.setValue(false);
        this.notifications.controls.sendBillingUserSynchronizationFailed.setValue(false);
        break;
      }
  }

  public updateUserImage(user: User) {
    if (this.image && !this.image.endsWith(Constants.USER_NO_PICTURE)) {
      // Set to user
      user.image = this.image;
    } else {
      // No image
      user.image = null;
    }
  }

  public saveUser(user: User) {
    if (this.currentUserID) {
      this.updateUser(user);
    } else {
      this.createUser(user);
    }
  }

  public imageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.maxSize * 1024)) {
        this.messageService.showErrorMessage('users.picture_size_error', {maxPictureKb: this.maxSize});
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearImage() {
    this.image = Constants.USER_NO_PICTURE;
    this.formGroup.markAsDirty();
  }

  revokeConcurAccount() {
    this.centralServerService.deleteIntegrationConnection(this.currentUserID, 'concur').subscribe((response: ActionResponse) => {
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('settings.refund.concur.revoke_success');
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'settings.refund.concur.revoke_error');
        }
        this.loadApplicationSettings();
      }, (error) => {
        Utils.handleError(JSON.stringify(error),
          this.messageService, 'settings.refund.concur.revoke_error');
        this.loadApplicationSettings();
      },
    );
  }

  linkConcurAccount() {
    if (!this.refundSetting || !this.refundSetting.content || !this.refundSetting.content.concur) {
      this.messageService.showErrorMessage(
        this.translateService.instant('transactions.notification.refund.tenant_concur_connection_invalid'));
    } else {
      const concurSetting = this.refundSetting.content.concur;
      const returnedUrl = `${this.windowService.getOrigin()}/users/connections`;
      // const returnedUrl = 'https://slfcah.evse.cfapps.eu10.hana.ondemand.com/users/connections';
      const state = {
        connector: 'concur',
        appId: this.refundSetting.id,
        userId: this.currentUserID,
      };
      this.document.location.href =
        // tslint:disable-next-line:max-line-length
        `${concurSetting.authenticationUrl}/oauth2/v0/authorize?client_id=${concurSetting.clientId}&response_type=code&scope=EXPRPT&redirect_uri=${returnedUrl}&state=${JSON.stringify(state)}`;
    }
  }

  getConcurUrl(): string|null {
    if (this.refundSetting && this.refundSetting.content && this.refundSetting.content.concur) {
      return this.refundSetting.content.concur.apiUrl;
    }
    return null;
  }

  getInvoice() {
    this.spinnerService.show();
    this.centralServerService.getUserInvoice(this.currentUserID).subscribe((result) => {
      this.spinnerService.hide();
      const blob = new Blob([result], {type: 'application/pdf'});
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        case 404:
          this.messageService.showErrorMessage('users.invoicing.errors.no_invoice_found');
          break;
        default:
          this.messageService.showErrorMessage('users.invoicing.errors.unable_to_get_invoice');
      }
    });
  }

  toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  firstLetterToUpperCase(control: AbstractControl) {
    control.setValue(Utils.firstLetterInUpperCase(control.value));
  }

  private loadApplicationSettings() {
    // if (this.authorizationService.canListSettings()) {
    this.centralServerService.getSettings(TenantComponents.REFUND).subscribe((settingResult) => {
      if (settingResult && settingResult.result && settingResult.result.length > 0) {
        this.refundSetting = settingResult.result[0] as RefundSettings;
      }
    });
    if (this.currentUserID) {
      this.centralServerService.getIntegrationConnections(this.currentUserID).subscribe((connectionResult) => {
        // @ts-ignore
        this.integrationConnections = null;
        // @ts-ignore
        this.concurConnection = null;
        this.isConcurConnectionValid = false;
        if (connectionResult && connectionResult.result && connectionResult.result.length > 0) {
          for (const connection of connectionResult.result) {
            if (connection.connectorId === 'concur') {
              this.concurConnection = connection;
              this.isConcurConnectionValid = this.concurConnection &&
                this.concurConnection.validUntil &&
                new Date(this.concurConnection.validUntil).getTime() > new Date().getTime();
            }
          }
          this.integrationConnections = connectionResult.result;
        }
      });
    }
    // }
  }

  private assignTransactionsToUser(user: User) {
    // Show
    this.spinnerService.show();
    // Assign Transaction
    this.centralServerService.assignTransactionsToUser(user.id).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('users.assign_transactions_success', {userFullName: user.firstName + ' ' + user.name});
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'users.assign_transactions_error');
      }
      // Close dialog
      if (this.inDialog && this.dialogRef) {
        this.dialogRef.close(true);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.assign_transactions_error');
    });
  }

  private createUser(user: User) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateUserImage(user);
    // Yes: Update
    this.centralServerService.createUser(user).subscribe((response: ActionResponse) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('users.create_success', {userFullName: user.firstName + ' ' + user.name});
        // Refresh
        user.id = response.id!;
        this.currentUserID = response.id!;
        // Init form
        this.formGroup.markAsPristine();
        // Assign transactions?
        this.checkUnassignedTransactions(user);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'users.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case 510:
          this.messageService.showErrorMessage('authentication.email_already_exists');
          break;
        // User Tag ID is already used
        case 540:
          this.messageService.showErrorMessage('users.user_tag_id_already_used');
          break;
        // User deleted
        case 550:
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        // No longer exists!
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.create_error');
      }
    });
  }

  private updateUser(user: User) {
    // Show
    this.spinnerService.show();
    // Set the image
    this.updateUserImage(user);
    // Yes: Update
    this.centralServerService.updateUser(user).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('users.update_success', {userFullName: user.firstName + ' ' + user.name});
        // Init form
        this.formGroup.markAsPristine();
        // Assign transactions?
        this.checkUnassignedTransactions(user);
      } else {
        // Error
        Utils.handleError(JSON.stringify(response), this.messageService, 'users.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case 510:
          this.messageService.showErrorMessage('authentication.email_already_exists');
          break;
        // User Tag ID is already used
        case 540:
          this.messageService.showErrorMessage('users.user_tag_id_already_used');
          break;
        // User deleted
        case 550:
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        // No longer exists!
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
      }
    });
  }

  private checkUnassignedTransactions(user: User) {
    // Admin?
    if (this.isAdmin) {
      // Check if there are unassigned transactions
      this.centralServerService.getUnassignedTransactionsCount(user.id).subscribe((count) => {
        if (count && count > 0) {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('users.assign_transactions_title'),
            this.translateService.instant('users.assign_transactions_confirm', {count}),
          ).subscribe((result) => {
            if (result === ButtonType.YES) {
              // Assign transactions
              this.assignTransactionsToUser(user);
            } else {
              // Close dialog
              if (this.inDialog && this.dialogRef) {
                this.dialogRef.close(true);
              }
            }
          });
        } else {
          // Close dialog
          if (this.inDialog && this.dialogRef) {
            this.dialogRef.close(true);
          }
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        if (this.currentUserID) {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
        } else {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.create_error');
        }
      });
    } else {
      // Close dialog
      if (this.inDialog && this.dialogRef) {
        this.dialogRef.close(true);
      }
    }
  }
}
