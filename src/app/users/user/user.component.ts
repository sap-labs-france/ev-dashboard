import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from '../../service/locale.service';
import { CentralServerService } from '../../service/central-server.service';
import { SpinnerService } from '../../service/spinner.service';
import { AuthorizationService } from '../../service/authorization-service';
import { MessageService } from '../../service/message.service';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';
import 'rxjs/add/operator/mergeMap';

@Component({
    selector: 'app-user-cmp',
    templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {
    private messages;
    private updateMode;
    public userStatuses;
    public userRoles;
    public userLocales;
    public isAdmin;
    public defaultPicture = Users.USER_NO_PICTURE;

    public user;
    public originalEmail;

    public formGroup: FormGroup;
    public id: AbstractControl;
    public name: AbstractControl;
    public firstName: AbstractControl;
    public image: AbstractControl;
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
            private translate: TranslateService,
            private localeService: LocaleService,
            private activatedRoute: ActivatedRoute,
            private router: Router) {
        // Get translated messages
        this.translate.get('users', {}).subscribe((messages) => {
            this.messages = messages;
        });
        this.updateMode = (this.activatedRoute.snapshot.params['id'] ? true : false);
        // Get statuses
        this.userStatuses = this.centralServerService.getUserStatuses();
        // Get Roles
        this.userRoles = this.centralServerService.getUserRoles();
        // Get Locales
        this.userLocales = this.localeService.getLocales();
        // Check auth
        if (this.updateMode) {
            // Check auth on Update
            if (!authorizationService.canUpdateUser({ 'id': this.activatedRoute.snapshot.params['id'] })) {
                // Not authorize
                this.router.navigate(['/']);
            }
        } else {
            // Check auth on Create
            if (!authorizationService.canCreateUser()) {
                // Not authorized
                this.router.navigate(['/']);
            }
        }
        // Admin?
        this.isAdmin = this.authorizationService.isAdmin();
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
            'image': new FormControl(''),
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
            'status': new FormControl(Users.USER_STATUS_ACTIVE,
                Validators.compose([
                    Validators.required
                ])),
            'role': new FormControl(Users.USER_ROLE_BASIC,
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
                        Validators.required,
                        Users.validatePassword
                    ])),
                'repeatPassword': new FormControl('',
                    Validators.compose([
                        Validators.required
                    ])),
            }, (passwordFormGroup: FormGroup) => {
                return Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword');
            })
        });
        // Form
        this.id = this.formGroup.controls['id'];
        this.name = this.formGroup.controls['name'];
        this.firstName = this.formGroup.controls['firstName'];
        this.image = this.formGroup.controls['image'];
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

    loadUser() {
        // Get the Charger?
        if (this.updateMode) {
            // Show spinner
            this.spinnerService.show();
            // Yes, get it
            this.centralServerService.getUser(this.activatedRoute.snapshot.params['id']).flatMap((foundUser) => {
                // Keep it
                this.user = foundUser;
                console.log('====================================');
                console.log(foundUser);
                console.log('====================================');
                // Yes, get image
                return this.centralServerService.getUserImage(this.activatedRoute.snapshot.params['id']);
            }).subscribe((userImage) => {
                // Init form
                if (this.user.id) {
                    this.formGroup.controls.id.setValue(this.user.id);
                }
                if (this.user.name) {
                    this.formGroup.controls.name.setValue(this.user.name);
                }
                if (this.user.firstName) {
                    this.formGroup.controls.firstName.setValue(this.user.firstName);
                }
                if (this.user.email) {
                    this.formGroup.controls.email.setValue(this.user.email);
                    this.originalEmail = this.user.email;
                }
                if (this.user.phone) {
                    this.formGroup.controls.phone.setValue(this.user.phone);
                }
                if (this.user.mobile) {
                    this.formGroup.controls.mobile.setValue(this.user.mobile);
                }
                if (this.user.iNumber) {
                    this.formGroup.controls.iNumber.setValue(this.user.iNumber);
                }
                if (this.user.costCenter) {
                    this.formGroup.controls.costCenter.setValue(this.user.costCenter);
                }
                if (this.user.status) {
                    this.formGroup.controls.status.setValue(this.user.status);
                }
                if (this.user.role) {
                    this.formGroup.controls.role.setValue(this.user.role);
                }
                if (this.user.locale) {
                    this.formGroup.controls.locale.setValue(this.user.locale);
                }
                if (this.user.tagIDs) {
                    this.formGroup.controls.tagIDs.setValue(this.user.tagIDs);
                }
                if (userImage) {
                    this.user.image = userImage.image;
                    this.formGroup.controls.image.setValue(this.user.image);
                }
                if (this.user.address && this.user.address.address1) {
                    this.address.controls.address1.setValue(this.user.address.address1);
                }
                if (this.user.address && this.user.address.address2) {
                    this.address.controls.address2.setValue(this.user.address.address2);
                }
                if (this.user.address && this.user.address.postalCode) {
                    this.address.controls.postalCode.setValue(this.user.address.postalCode);
                }
                if (this.user.address && this.user.address.city) {
                    this.address.controls.city.setValue(this.user.address.city);
                }
                if (this.user.address && this.user.address.department) {
                    this.address.controls.department.setValue(this.user.address.department);
                }
                if (this.user.address && this.user.address.region) {
                    this.address.controls.region.setValue(this.user.address.region);
                }
                if (this.user.address && this.user.address.country) {
                    this.address.controls.country.setValue(this.user.address.country);
                }
                if (this.user.address && this.user.address.latitude) {
                    this.address.controls.latitude.setValue(this.user.address.latitude);
                }
                if (this.user.address && this.user.address.longitude) {
                    this.address.controls.longitude.setValue(this.user.address.longitude);
                }
                // Hide
                this.spinnerService.hide();
            }, (error) => {
                // Hide
                this.spinnerService.hide();
                // Handle error
                switch (error.status) {
                    // Not found
                    case 550:
                        // Transaction not found`
                        Utils.handleHttpError(error, this.router, this.messageService,
                            this.messages['user_not_found']);
                        break;
                    default:
                        // Unexpected error`
                        Utils.handleHttpError(error, this.router, this.messageService,
                            this.translate.instant('general.unexpected_error_backend'));
                }
            });
        }
    }
}
