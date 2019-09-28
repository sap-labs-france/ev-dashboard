import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../app.module';
import { DialogsModule } from '../shared/dialogs/dialogs.module';
import { AuthenticationRoutes } from './authentication.routing';
import { AuthenticationEulaComponent } from './eula/authentication-eula.component';
import { AuthenticationLoginComponent } from './login/authentication-login.component';
import { AuthenticationRegisterComponent } from './register/authentication-register.component';
import { AuthenticationResetPasswordComponent } from './reset-password/authentication-reset-password.component';
import { AuthenticationRetrievePasswordComponent } from './retrieve-password/authentication-retrieve-password.component';
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
  ],
  declarations: [
    AuthenticationLoginComponent,
    AuthenticationEulaComponent,
    AuthenticationRegisterComponent,
    AuthenticationResetPasswordComponent,
    AuthenticationRetrievePasswordComponent,
    AuthenticationVerifyEmailComponent,
  ],
})

export class AuthenticationModule {
}
