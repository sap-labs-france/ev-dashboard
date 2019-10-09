import { Routes } from '@angular/router';
import { AuthenticationEulaComponent } from './eula/authentication-eula.component';
import { AuthenticationLoginComponent } from './login/authentication-login.component';
import { AuthenticationRegisterComponent } from './register/authentication-register.component';
import { AuthenticationResetPasswordComponent } from './reset-password/authentication-reset-password.component';
import { AuthenticationRetrievePasswordComponent } from './retrieve-password/authentication-retrieve-password.component';
import { AuthenticationVerifyEmailComponent } from './verify-email/authentication-verify-email.component';

export const AuthenticationRoutes: Routes = [
  {
    path: 'login',
    component: AuthenticationLoginComponent,
  }, {
    path: 'retrieve-password',
    component: AuthenticationRetrievePasswordComponent,
  }, {
    path: 'reset-password',
    component: AuthenticationResetPasswordComponent,
  }, {
    path: 'register',
    component: AuthenticationRegisterComponent,
  }, {
    path: 'eula',
    component: AuthenticationEulaComponent,
  }, {
    path: 'verify-email',
    component: AuthenticationVerifyEmailComponent,
  }, {
    path: '**',
    redirectTo: 'login',
  },
];
