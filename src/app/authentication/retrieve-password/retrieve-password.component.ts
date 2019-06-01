import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {CentralServerService} from '../../services/central-server.service';
import {MessageService} from '../../services/message.service';
import {Utils} from '../../utils/Utils';
import {Constants} from '../../utils/Constants';
import {SpinnerService} from '../../services/spinner.service';
import {ReCaptchaV3Service} from 'ng-recaptcha';

@Component({
  selector: 'app-retrieve-password-cmp',
  templateUrl: './retrieve-password.component.html'
})

export class RetrievePasswordComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public formGroup: FormGroup;
  private messages: Object;
  public resetPasswordHash: string;
  public resetPasswordEmail: string;

  constructor(
      private centralServerService: CentralServerService,
      private router: Router,
      private route: ActivatedRoute,
      private spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private reCaptchaV3Service: ReCaptchaV3Service) {
    // Load the tranlated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Init Form
    this.formGroup = new FormGroup({
      'email': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email
        ]))
    });
    // Form
    this.email = this.formGroup.controls['email'];
    this.resetPasswordHash = this.route.snapshot.queryParamMap.get('hash');
    this.resetPasswordEmail = this.route.snapshot.queryParamMap.get('email');
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(function () {
      // After 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
    // Check the hash
    if (this.resetPasswordHash && this.resetPasswordEmail) {
      // Set
      this.formGroup.controls.email.setValue(this.resetPasswordEmail);
      // Reset
      this.resetPassword({
        'email': this.resetPasswordEmail,
        'hash': this.resetPasswordHash
      });
    }
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  resetPassword(data) {
    this.reCaptchaV3Service.execute('Reset').subscribe((token) => {
        data['captcha'] = token;
        // Show
        this.spinnerService.show();
        // Yes: Update
        this.centralServerService.resetUserPassword(data).subscribe((response) => {
          // Hide
          this.spinnerService.hide();
          // Success
          if (response.status && response.status === Constants.REST_RESPONSE_SUCCESS) {
            // Show message`
            this.messageService.showSuccessMessage(
              this.messages[(!this.resetPasswordHash ? 'reset_password_success' : 'reset_password_success_ok')]);
            // Go back to login
            this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
            // Unexpected Error
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.messages['reset_password_error']);
          }
        }, (error) => {
          // Hide
          this.spinnerService.hide();
          // Check status error code
          switch (error.status) {
            // Hash no longer valid
            case 540:
              this.messageService.showErrorMessage(this.messages['reset_password_hash_not_valid']);
              break;
            // Email does not exist
            case 550:
              this.messageService.showErrorMessage(this.messages['reset_password_email_not_valid']);
              break;
            // Unexpected error`
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
          }
        });
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    });
  }
}
