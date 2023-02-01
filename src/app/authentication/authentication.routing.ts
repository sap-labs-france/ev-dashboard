import { Routes } from '@angular/router';

import { AccountOnboardingComponent } from './account-onboarding/account-onboarding.component';
import { AuthenticationDefinePasswordComponent } from './define-password/authentication-define-password.component';
import { AuthenticationEulaComponent } from './eula/authentication-eula.component';
import { AuthenticationLoginComponent } from './login/authentication-login.component';
import { AuthenticationMercedesDataUsageComponent } from './mercedes-data-usage/authentication-mercedes-data-usage.component';
import { AuthenticationRegisterComponent } from './register/authentication-register.component';
import { AuthenticationResetPasswordComponent } from './reset-password/authentication-reset-password.component';
import { ScanPayEmailComponent } from './scan-pay/email/scan-pay-email.component';
import { ShowTransactionComponent } from './scan-pay/show-transaction/show-transaction.component';
import { ScanPayStripePaymentIntentComponent } from './scan-pay/stripe/scan-pay-stripe-payment-intent.component';
import { AuthenticationVerifyEmailComponent } from './verify-email/authentication-verify-email.component';

export const AuthenticationRoutes: Routes = [
  {
    path: 'login',
    component: AuthenticationLoginComponent,
  }, {
    path: 'define-password',
    component: AuthenticationDefinePasswordComponent,
  }, {
    path: 'reset-password',
    component: AuthenticationResetPasswordComponent,
  }, {
    path: 'register',
    component: AuthenticationRegisterComponent,
  }, {
    path: 'eula',
    component: AuthenticationEulaComponent,
  },
  {
    path: 'mercedes-data-usage',
    component: AuthenticationMercedesDataUsageComponent,
  },
  {
    path: 'verify-email',
    component: AuthenticationVerifyEmailComponent,
  },
  {
    path: 'account-onboarding',
    component: AccountOnboardingComponent,
  },
  // Step #1 - flash QR code
  {
    path: 'scan-pay/:siteAreaID/:chargingStationID/:connectorID',
    component: ScanPayEmailComponent,
  },
  // Step #2 - click on the link from the email
  {
    path: 'scan-pay',
    component: ScanPayStripePaymentIntentComponent,
  },
  // Step #3 - show and can stop transaction
  // {
  //   path: 'scan-pay/stop/:transactionID/:token',
  //   component: ShowTransactionComponent,
  // },
  {
    path: 'scan-pay/stop/:transactionID',
    component: ShowTransactionComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
