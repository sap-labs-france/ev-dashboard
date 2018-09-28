import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { Utils } from '../../utils/Utils';

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
  public captchaSiteKey: string;
  @ViewChild('recaptcha') public recaptcha;

  constructor(
      private centralServerService: CentralServerService,
      private router: Router,
      private route: ActivatedRoute,
      private messageService: MessageService,
      private translateService: TranslateService,
      private configService: ConfigService) {
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
        ])),
      'captcha': new FormControl('',
        Validators.compose([
          Validators.required
        ]))
    });
    // Form
    this.email = this.formGroup.controls['email'];
    // Set the Captcha Key
    this.captchaSiteKey = this.configService.getUser().captchaSiteKey;
    this.resetPasswordHash = this.route.snapshot.queryParamMap.get('hash');
    this.resetPasswordEmail = this.route.snapshot.queryParamMap.get('email');
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
    // Yes: Update
    this.centralServerService.resetUserPassword(data).subscribe((response) => {
      // Success
      if (response.status && response.status === 'Success') {
        // Show message`
        this.messageService.showSuccessMessage(
          this.messages[(!this.resetPasswordHash ? 'reset_password_success' : 'reset_password_success_ok')]);
        // Go back to login
        this.router.navigate(['/auth/login'], { queryParams: { email: this.email.value });
        // Unexpected Error
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['reset_password_error']).subscribe(() => {
            // Reset
            this.recaptcha.reset();
          });
      }
    }, (error) => {
      // Reset
      this.recaptcha.reset();
      // Check status error code
      switch (error.status) {
        // Hash no longer valid
        case 540:
          // Report the error
          this.messageService.showErrorMessage(this.messages['reset_password_hash_not_valid']);
          break;
        // Email does not exist
        case 550:
          // Report the error
          this.messageService.showErrorMessage(this.messages['reset_password_email_not_valid']);
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('general.unexpected_error_backend'));
}
    });
  }
}
