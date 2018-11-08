import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {RecaptchaFormsModule} from 'ng-recaptcha/forms';
import {RecaptchaModule} from 'ng-recaptcha';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {AuthenticationRoutes} from './authentication.routing';
import {MaterialModule} from '../app.module';
import {RegisterComponent} from './register/register.component';
import {RetrievePasswordComponent} from './retrieve-password/retrieve-password.component';
import {LoginComponent} from './login/login.component';
import {EulaComponent} from './eula/eula.component';
import {VerifyEmailComponent} from './verify-email/verify-email.component';
import {DialogsModule} from '../shared/dialogs/dialogs.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    DialogsModule
  ],
  declarations: [
    LoginComponent,
    EulaComponent,
    RegisterComponent,
    RetrievePasswordComponent,
    VerifyEmailComponent
  ]
})

export class AuthenticationModule {
}
