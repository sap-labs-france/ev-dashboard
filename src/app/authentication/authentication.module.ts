import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../app.module';
import { DialogsModule } from '../shared/dialogs/dialogs.module';
import { AuthenticationRoutes } from './authentication.routing';
import { EulaComponent } from './eula/eula.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RetrievePasswordComponent } from './retrieve-password/retrieve-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
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
