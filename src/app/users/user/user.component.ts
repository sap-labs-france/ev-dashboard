import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { LocaleService } from '../../service/locale.service';
import { CentralServerService } from '../../service/central-server.service';
import { SpinnerService } from '../../service/spinner.service';
import { AuthorizationService } from '../../service/authorization-service';
import { MessageService } from '../../service/message.service';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';
import { Constants } from '../../utils/Constants';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';
import 'rxjs/add/operator/mergeMap';
import { DataSource } from '@angular/cdk/table';
import { Site } from '../../model/site';
import { User } from '../../model/user';
import { TableComponent } from '../../shared/table/table.component';
import { TableDataSource } from '../../shared/table/table-data-source';
import { TableColumnDef } from '../../model/table-column-def';

@Component({
    selector: 'app-user-cmp',
    templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {
    @ViewChild('siteTable') siteTable: TableComponent;
    public parentErrorStateMatcher = new ParentErrorStateMatcher();
    private messages;
    public userStatuses;
    public userRoles;
    public userLocales;
    public isAdmin;
    public originalEmail;
    public image = Constants.USER_NO_PICTURE;
    public hideRepeatPassword = true;
    public hidePassword = true;
    public siteDataSource: SiteDataSource;

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

    public passwords: FormGroup;
    public password: AbstractControl;
    public repeatPassword: AbstractControl;

    constructor(
            private authorizationService: AuthorizationService,
            private centralServerService: CentralServerService,
            private messageService: MessageService,
            private spinnerService: SpinnerService,
            private translateService: TranslateService,
            private localeService: LocaleService,
            private activatedRoute: ActivatedRoute,
            private router: Router) {
        // Check auth
        if (!this.activatedRoute.snapshot.params['id'] ||
            !authorizationService.canUpdateUser({ 'id': this.activatedRoute.snapshot.params['id'] })) {
            // Not authorized
            this.router.navigate(['/']);
        }
        // Get translated messages
        this.translateService.get('users', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Get statuses
        this.userStatuses = this.centralServerService.getUserStatuses();
        // Get Roles
        this.userRoles = this.centralServerService.getUserRoles();
        // Get Locales
        this.userLocales = this.localeService.getLocales();
        // Admin?
        this.isAdmin = this.authorizationService.isAdmin();
        // Create table data source
        this.siteDataSource = new SiteDataSource(
            this.messageService,
            this.translateService,
            this.router,
            this.centralServerService);
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
                    Validators.pattern('^[A-Z0-9,]*$')
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
        // Subscribe to changes in params
        this.activatedRoute.params.subscribe((params: Params) => {
            // Load User
            this.loadUser();
        });
        // Scroll up
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
    }

    setAddress(address: Address) {
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

    showPlace() {
        window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
    }

    refresh() {
        this.loadUser();
    }

    loadUser() {
        // Show spinner
        this.spinnerService.show();
        // Yes, get it
        this.centralServerService.getUser(this.activatedRoute.snapshot.params['id']).flatMap((user) => {
            // Set user
            this.siteDataSource.setUser(user);
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
            return this.centralServerService.getUserImage(this.activatedRoute.snapshot.params['id']);
        }).subscribe((userImage) => {
            if (userImage && userImage.image) {
                this.image = userImage.image.toString();
            }
            // Hide
            this.spinnerService.hide();
        }, (error) => {
            // Hide
            this.spinnerService.hide();
            // Handle error
            switch (error.status) {
                // Server not responding
                case 0:
                    // Report the error
                    this.messageService.showErrorMessage(this.translateService.instant('general.backend_not_running'));
                    break;

                // Not found
                case 550:
                    // Transaction not found`
                    Utils.handleHttpError(error, this.router, this.messageService,
                        this.messages['user_not_found']);
                    break;
                default:
                    // Unexpected error`
                    Utils.handleHttpError(error, this.router, this.messageService,
                        this.translateService.instant('general.unexpected_error_backend'));
            }
        });
    }

    updateUserImage(user) {
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

    saveUser(user) {
        // Show
        this.spinnerService.show();
        // Set the image
        this.updateUserImage(user);
        // Yes: Update
        this.centralServerService.updateUser(user).subscribe(response => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status === 'Success') {
                // Ok
                this.messageService.showSuccessMessage(this.translateService.instant('users.update_success',
                    { 'userFullName': user.firstName + ' ' + user.name }));
                // Refresh
                this.refresh();
            } else {
                Utils.handleError(JSON.stringify(response), this.router, this.messageService, this.messages['update_error']);
            }
        }, (error) => {
            // Hide
            this.spinnerService.hide();
            // Check status
            switch (error.status) {
                // Email already exists
                case 510:
                    // Show error
                    this.messageService.showErrorMessage(
                        this.translateService.instant('authentication.email_already_exists'));
                    break;
                // User deleted
                case 550:
                    // Show error
                    this.messageService.showErrorMessage(this.messages['user_do_not_exist']);
                    break;
                default:
                    // No longer exists!
                    Utils.handleHttpError(error, this.router, this.messageService, this.messages['update_error']);
            }
        });
    }

    clearImage() {
        jQuery('.fileinput-preview img')[0]['src'] = Constants.USER_NO_PICTURE;
    }
}

class SiteDataSource extends TableDataSource<Site> implements DataSource<Site> {
    private user: User;

    constructor(
            private messageService: MessageService,
            private translateService: TranslateService,
            private router: Router,
            private centralServerService: CentralServerService) {
        super();
    }

    load() {
        // User provided?
        if (this.user) {
            // Update page length (number of sites is in User)
            this.updatePaginator();
            // Yes: Get data
            this.centralServerService.getSites(this.getSearch(),
                    this.getPaging(), this.getOrdering()).subscribe((sites) =>  {
                // Return sites
                this.getSubjet().next(sites);
            }, (error) => {
                // No longer exists!
                Utils.handleHttpError(error, this.router, this.messageService, this.translateService.instant('sites.update_error'));
            });
        } else {
            // Update page length
            this.updatePaginator();
            // Return sites
            this.getSubjet().next([]);
        }
    }

    getColumnDefs(): TableColumnDef[] {
        // As sort directive in table can only be unset in Angular 7, all columns will be sortable
        return [
            { id: 'name', name: 'Name', class: 'text-left', sorted: true, direction: 'asc' },
            { id: 'address.city', name: 'City', class: 'text-left' }
        ];
    }

    setUser(user: User) {
        // Set user
        this.user = user;
        // Reload the table
        this.load();
    }

    getNumberOfRecords(): number {
        // Check
        if (!this.user) {
            return 0;
        }
        return this.user.numberOfSites;
    }
}

