import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { CentralServerService } from '../../service/central-server.service';
import { ConfigService } from '../../service/config.service';
import { MessageService } from '../../service/message.service';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';

@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit, OnDestroy {
    public parentErrorStateMatcher = new ParentErrorStateMatcher();
    public formGroup: FormGroup;
    public name: AbstractControl;
    public firstName: AbstractControl;
    public email: AbstractControl;
    public passwords: FormGroup;
    public password: AbstractControl;
    public repeatPassword: AbstractControl;
    public acceptEula: AbstractControl;
    private messages: Object;
    public captchaSiteKey: string;
    @ViewChild('recaptcha') public recaptcha;

    constructor(
            private centralServerService: CentralServerService,
            private router: Router,
            private messageService: MessageService,
            private translateService: TranslateService,
            private configService: ConfigService) {
        // Load the tranlated messages
        this.translateService.get('authentication', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Init Form
        this.formGroup = new FormGroup({
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
            }),
            'captcha': new FormControl('',
                Validators.compose([
                    Validators.required
                ])),
            'acceptEula': new FormControl('',
                Validators.compose([
                    Validators.required
                ]))
        });
        // Form
        this.name = this.formGroup.controls['name'];
        this.email = this.formGroup.controls['email'];
        this.passwords = <FormGroup>this.formGroup.controls['passwords'];
        this.password = this.passwords.controls['password'];
        this.repeatPassword = this.passwords.controls['repeatPassword'];
        this.firstName = this.formGroup.controls['firstName'];
        this.acceptEula = this.formGroup.controls['acceptEula'];
        // Set the Captcha Key
        this.captchaSiteKey = this.configService.getUser().captchaSiteKey;
    }

    ngOnInit() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('lock-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }

    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('lock-page');
        body.classList.remove('off-canvas-sidebar');
    }

    register(user) {
        if (this.formGroup.valid) {
            // Create
            this.centralServerService.registerUser(user).subscribe((response) => {
                // Ok?
                if (response.status && response.status === 'Success') {
                    // Show success
                    this.messageService.showSuccessMessage(this.messages['register_user_success']);
                    // login successful so redirect to return url
                    this.router.navigate(['/auth/login'], { queryParams: { email: this.email.value } });
                } else {
                    // Unexpected Error
                    Utils.handleError(JSON.stringify(response), this.router,
                        this.messageService, this.messages['register_user_error']);
                }
            }, (error) => {
                // Enabled again
                this.recaptcha.reset();
                // Check status
                switch (error.status) {
                    // Server not responding
                    case 0:
                        // Report the error
                        this.messageService.showErrorMessage(this.translateService.instant('general.backend_not_running'));
                        break;

                    // Email already exists
                    case 510:
                        // Show error
                        this.messageService.showErrorMessage(this.messages['email_already_exists']);
                        break;

                    // User Agreement not checked
                    case 520:
                        // You must accept
                        this.messageService.showErrorMessage(this.messages['must_accept_eula']);
                        break;

                    default:
                        // No longer exists!
                        Utils.handleHttpError(error, this.router, this.messageService, this.messages['register_user_error']);
                }
            });
        }
    }
}
