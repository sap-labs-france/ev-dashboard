import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { CentralServerService } from '../../service/central-server.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Users } from '../../utils/Users';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    styleUrls: ['./login.component.scss'],
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public formGroup: FormGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public acceptEula: AbstractControl;

    constructor(
        private element: ElementRef,
        private centralServerService: CentralServerService,
        private translate: TranslateService,
        private formBuilder: FormBuilder) {
        // Set
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        // Init Form
        this.formGroup = formBuilder.group({
            'email': new FormControl('',
                Validators.compose([
                    Validators.required
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
        // Form
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
        console.log(this.formGroup.valid);
        console.log(user);
    }
}
