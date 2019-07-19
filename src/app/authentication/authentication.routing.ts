import { Routes } from '@angular/router';
import { EulaComponent } from './eula/eula.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RetrievePasswordComponent } from './retrieve-password/retrieve-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

export const AuthenticationRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'retrieve-password',
    component: RetrievePasswordComponent
  }, {
    path: 'reset-password',
    component: RetrievePasswordComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }, {
    path: 'eula',
    component: EulaComponent
  }, {
    path: 'verify-email',
    component: VerifyEmailComponent
  }, {
    path: '**',
    redirectTo: 'login'
  }
];
