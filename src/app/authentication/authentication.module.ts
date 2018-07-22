import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationGuard } from './authentication-guard';
import { AuthenticationRoutes } from './authentication.routing';
import { TranslateModule } from '@ngx-translate/core';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { RetrievePasswordComponent } from './retrieve-password/retrieve-password.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    FormsModule,
    MaterialModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    PricingComponent,
    RetrievePasswordComponent
  ],
  providers: [
    AuthenticationGuard
  ]
})

export class AuthenticationModule {}
