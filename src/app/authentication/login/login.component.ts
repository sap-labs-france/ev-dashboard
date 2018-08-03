import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CentralServerService } from '../../service/central-server.service';
import { MessageService } from '../../service/message.service';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public returnUrl: String;
    public formGroup: FormGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public acceptEula: AbstractControl;
    private messages: Object;

    constructor(
        private element: ElementRef,
        private centralServerService: CentralServerService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private translate: TranslateService) {

        // Set
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        // Load the tranlated messages
        this.translate.get('authentication', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Init Form
        this.formGroup = new FormGroup({
            'email': new FormControl('',
                Validators.compose([
                    Validators.required,
                    Validators.email
                ])),
            'password': new FormControl('',
                Validators.compose([
                    Validators.required
                ])),
            'acceptEula': new FormControl('',
                Validators.compose([
                    Validators.required
                ]))
        });
        // Get controls
        this.email = this.formGroup.controls['email'];
        this.password = this.formGroup.controls['password'];
        this.acceptEula = this.formGroup.controls['acceptEula'];
    }

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    sidebarToggle() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        const sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible === false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }

    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
        body.classList.remove('off-canvas-sidebar');
    }

    login(user: Object): void {
        // Login
        this.centralServerService.login(user).subscribe((result) => {
            // Success
            this.centralServerService.loggingSucceeded(result.token);
            // login successful so redirect to return url
            this.router.navigate([this.returnUrl]);
        }, (error) => {
            // Check error code
            switch (error.status) {
                // User Agreement not checked
                case 520:
                    // You must accept
                    this.messageService.showErrorMessage(this.messages['must_accept_eula']);
                    break;

                // Unknown Email
                case 550:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['email_does_not_exist']);
                    break;

                // Account is locked
                case 570:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['account_locked']);
                    break;

                // Account not Active
                case 580:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['account_not_active']);
                    break;

                default:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['wrong_email_or_password']);
                    break;
            }
        });
    }
}
