import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScanPayEmailComponent } from 'authentication/scan-pay/email/scan-pay-email.component';
import { ComponentModule } from 'shared/component/component.module';
import { FormattersModule } from 'shared/formatters/formatters.module';

import { MaterialModule } from '../app.module';
import { DialogsModule } from '../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../shared/directives/directives.module';
import { AccountOnboardingComponent } from './account-onboarding/account-onboarding.component';
import { AuthenticationRoutes } from './authentication.routing';
import { AuthenticationDefinePasswordComponent } from './define-password/authentication-define-password.component';
import { AuthenticationEulaComponent } from './eula/authentication-eula.component';
import { AuthenticationLoginComponent } from './login/authentication-login.component';
import { AuthenticationMercedesDataUsageComponent } from './mercedes-data-usage/authentication-mercedes-data-usage.component';
import { AuthenticationRegisterComponent } from './register/authentication-register.component';
import { AuthenticationResetPasswordComponent } from './reset-password/authentication-reset-password.component';
import { ScanPayInvoiceComponent } from './scan-pay/invoices/scan-pay-invoice.component';
import { ScanPayComponent } from './scan-pay/scan-pay.component';
import { ScanPayShowTransactionComponent } from './scan-pay/show-transaction/scan-pay-show-transaction.component';
import { ScanPayStripePaymentIntentComponent } from './scan-pay/stripe/scan-pay-stripe-payment-intent.component';
import { AuthenticationVerifyEmailComponent } from './verify-email/authentication-verify-email.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    DialogsModule,
    CommonDirectivesModule,
    ComponentModule,
    FormattersModule,
  ],
  declarations: [
    AuthenticationLoginComponent,
    AuthenticationEulaComponent,
    AuthenticationMercedesDataUsageComponent,
    AuthenticationRegisterComponent,
    AuthenticationResetPasswordComponent,
    AuthenticationDefinePasswordComponent,
    AuthenticationVerifyEmailComponent,
    AccountOnboardingComponent,
    ScanPayStripePaymentIntentComponent,
    ScanPayEmailComponent,
    ScanPayShowTransactionComponent,
    ScanPayComponent,
    ScanPayInvoiceComponent,
  ],
})

export class AuthenticationModule {
}
