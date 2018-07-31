import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CentralServerService } from '../../service/central-server.service';
import { ConfigService } from '../../service/config.service';
import { MessageService } from '../../service/message.service';
import { Users } from '../../utils/Users';

@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html'
  })

export class RegisterComponent implements OnInit, OnDestroy {
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
            private route: ActivatedRoute,
            private messageService: MessageService,
            private translate: TranslateService,
            private formBuilder: FormBuilder,
            private configService: ConfigService) {
                // Load the tranlated messages
        this.translate.get('authentication', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Init Form
        this.formGroup = this.formBuilder.group({
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

            'passwords': formBuilder.group({
              'password': ['',
                Validators.compose([
                  Validators.required,
                  Users.validatePassword
                ])],
              'repeatPassword': ['',
                Validators.compose([
                  Validators.required,
                  Users.validatePassword
                ])],
              }, {
                validator: Users.validateEqualPassword('password', 'repeatPassword') 
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
        this.password = this.formGroup.controls['password'];
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
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }

    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('lock-page');
      body.classList.remove('off-canvas-sidebar');
    }

    register(data) {
      //   // Yes: Update
      //   this.centralServerService.resetUserPassword(data).subscribe((response) => {
      //     // Success
      //     if (response.status && response.status === 'Success') {
      //       // Show message`
      //       this.messageService.showSuccessMessage(
      //         this.messages[(!this.resetPasswordHash ? 'reset_password_success' : 'reset_password_success_ok')]);
      //       // Go back to login
      //       this.router.navigate(['/authentication/login']);
      //       // Unexpected Error
      //     } else {
      //       Utils.handleError(JSON.stringify(response),
      //           this.router, this.messageService, this.messages['reset_password_error']).subscribe(() => {
      //         // Reset
      //         this.recaptcha.reset();
      //       });
      //     }
      //   }, (error) => {
      //     // Reset
      //     this.recaptcha.reset();
      //     // Check status error code
      //     switch (error.status) {
      //       // Hash no longer valid
      //       case 540:
      //         // Report the error
      //         this.messageService.showErrorMessage(this.messages['reset_password_hash_not_valid']);
      //         break;
      //       // Email does not exist
      //       case 550:
      //         // Report the error
      //         this.messageService.showErrorMessage(this.messages['reset_password_email_not_valid']);
      //         break;
      //       default:
      //         // Report the error
      //         Utils.handleHttpError(error, this.router, this.messageService, this.messages['reset_password_error']);
      //         break;
      //     }
      //   });
      }
    }
