import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app.module';
import { DialogsModule } from 'shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from 'shared/directives/directives.module';
import { ScanPayRoutes } from './scan-pay.routing';
import { ScanPayStripePaymentMethodComponent } from './stripe/scan-pay-stripe-payment-method.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ScanPayRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    DialogsModule,
    CommonDirectivesModule,
  ],
  declarations: [
    // ScanPayStripePaymentMethodComponent
    // AuthenticationLoginComponent,
    // AuthenticationEulaComponent,
    // AuthenticationMercedesDataUsageComponent,
    // AuthenticationRegisterComponent,
    // AuthenticationResetPasswordComponent,
    // AuthenticationDefinePasswordComponent,
    // AuthenticationVerifyEmailComponent,
    // AccountOnboardingComponent
  ],
})

export class ScanPayModule {
}
