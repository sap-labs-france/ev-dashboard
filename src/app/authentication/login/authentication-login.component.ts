import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'app/services/window.service';
import { AuthorizationService } from '../../services/authorization.service';
import { CentralServerService } from '../../services/central-server.service';
import { DialogService } from '../../services/dialog.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Constants } from '../../utils/Constants';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

declare var $: any;

@Component({
  selector: 'app-authentication-login',
  templateUrl: './authentication-login.component.html'
})
export class AuthenticationLoginComponent implements OnInit, OnDestroy {
  public returnUrl: String;
  public formGroup: FormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  public acceptEula: AbstractControl;
  public hidePassword = true;
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;
  private messages: Object;
  private subDomain: string;

  constructor(
    private element: ElementRef,
    private centralServerService: CentralServerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private windowService: WindowService,
    private translateService: TranslateService,
    private authorizationService: AuthorizationService) {

    // Set
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    // Load the tranlated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Init Form
    this.formGroup = new FormGroup({
      'email': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email
        ])),
      'password': new FormControl('',
        Validators.compose([
          Validators.required,
          Users.passwordWithNoSpace
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
    // Check URL params
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.email.setValue(email);
    }
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
    if (this.route.snapshot.fragment) {
      this.returnUrl += `#${this.route.snapshot.fragment}`;
    }
    // Auto Logon in case of demo users
    const _email = this.route.snapshot.queryParamMap.get('email');
    const _password = this.route.snapshot.queryParamMap.get('password');
    if (_email === 'demo.demo@sap.com' && _password) {
      this.email.setValue(_email);
      this.password.setValue(_password);
      this.acceptEula.setValue('true');
      this.login(this.formGroup.value);
    }
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
    // Show
    this.spinnerService.show();
    // clear User and UserAuthorization
    this.authorizationService.cleanUserAndUserAuthorization();
    // Login
    this.centralServerService.login(user).subscribe((result) => {
      // Hide
      this.spinnerService.hide();
      // Success
      this.centralServerService.loggingSucceeded(result.token);
      // login successful so redirect to return url
      this.router.navigateByUrl(this.returnUrl as string);
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check error code
      switch (error.status) {
        // Wrong email or password
        case 550:
          // Report the error
          this.messageService.showErrorMessage(this.messages['wrong_email_or_password']);
          break;
        // Account is locked
        case 570:
          // Report the error
          this.messageService.showErrorMessage(this.messages['account_locked']);
          break;
        // Account Suspended
        case 580:
          // Report the error
          this.messageService.showErrorMessage(this.messages['account_suspended']);
          break;
        // Account Pending
        case 590:
          // Pending Users from the Super Tenant should not be able to request an activation email
          if (this.subDomain !== '') {
            // Usual Users
            this.messageService.showWarningMessage(this.messages['account_pending']);
            // No Create and show dialog data
            this.dialogService.createAndShowYesNoDialog(
              this.translateService.instant('authentication.verify_email_title'),
              this.translateService.instant('authentication.verify_email_resend_confirm')
            ).subscribe((response) => {
              if (response === Constants.BUTTON_TYPE_YES) {
                this.router.navigate(['/auth/verify-email'], {queryParams: {Email: user['email']}});
              }
            });
          } else {
            // Super Admin Users
            this.messageService.showWarningMessage(this.messages['super_user_account_pending']);
          }
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }
}
