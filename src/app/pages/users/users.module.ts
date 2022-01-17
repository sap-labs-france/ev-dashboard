import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { ErrorCodeDetailsComponent } from '../../shared/component/error-code-details/error-code-details.component';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { ConcurUserConnectionComponent } from './connections/concur/concur-user-connection.component';
import { MercedesUserConnectionComponent } from './connections/mercedes/mercedes-user-connection.component';
import { AppUserRolePipe } from './formatters/user-role.pipe';
import { AppFormatUserStatusPipe, UserStatusFormatterComponent } from './formatters/user-status-formatter.component';
import { AppUserStatusPipe } from './formatters/user-status.pipe';
import { UsersInErrorTableDataSource } from './in-error/users-in-error-table-data-source';
import { UsersInErrorComponent } from './in-error/users-in-error.component';
import { UsersListComponent } from './list/users-list.component';
import { UserSitesAdminCheckboxComponent } from './user-sites/user-sites-admin-checkbox.component';
import { UserSitesDialogComponent } from './user-sites/user-sites-dialog.component';
import { UserSitesOwnerRadioComponent } from './user-sites/user-sites-owner-radio.component';
import { UserSitesTableDataSource } from './user-sites/user-sites-table-data-source';
import { UserMercedesCarConnectorComponent } from './user/connectors/car/mercedes/user-mercedes-car-connector.component';
import { UserConcurRefundConnectorComponent } from './user/connectors/refund/concur/user-concur-refund-connector.component';
import { UserConnectorsComponent } from './user/connectors/user-connectors.component';
import { UserMainComponent } from './user/main/user-main.component';
import { UserMiscsComponent } from './user/miscs/user-miscs.component';
import { UserNotificationsComponent } from './user/notifications/user-notifications.component';
import { AppPaymentMethodStatusPipe, PaymentMethodStatusComponent } from './user/payment-methods/payment-method/payment-method-status.component';
import { PaymentMethodDialogComponent } from './user/payment-methods/payment-method/payment-method.dialog.component';
import { StripePaymentMethodComponent } from './user/payment-methods/payment-method/stripe/stripe-payment-method.component';
import { PaymentMethodsComponent } from './user/payment-methods/payment-methods.component';
import { UserSecurityComponent } from './user/security/user-security.component';
import { UserDialogComponent } from './user/user-dialog.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users.component';
import { UserRoutes } from './users.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UserRoutes),
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    AddressModule,
    TableModule,
    DialogsModule,
    CommonDirectivesModule,
    FormattersModule,
  ],
  declarations: [
    UserStatusFormatterComponent,
    AppFormatUserStatusPipe,
    UsersListComponent,
    UsersInErrorComponent,
    UsersComponent,
    UserComponent,
    UserMainComponent,
    UserNotificationsComponent,
    UserSecurityComponent,
    UserConnectorsComponent,
    UserMercedesCarConnectorComponent,
    UserConcurRefundConnectorComponent,
    UserMiscsComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserSitesAdminCheckboxComponent,
    ConcurUserConnectionComponent,
    MercedesUserConnectionComponent,
    AppUserRolePipe,
    AppUserStatusPipe,
    UserSitesOwnerRadioComponent,
    StripePaymentMethodComponent,
    PaymentMethodsComponent,
    PaymentMethodDialogComponent,
    AppPaymentMethodStatusPipe,
    PaymentMethodStatusComponent
  ],
  entryComponents: [
    UserStatusFormatterComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserSitesAdminCheckboxComponent,
    ErrorCodeDetailsComponent,
    UserSitesOwnerRadioComponent,
  ],
  exports: [
    AppUserRolePipe,
    AppUserStatusPipe,
    UserDialogComponent,
  ],
  providers: [
    AppUserRolePipe,
    AppUserStatusPipe,
    UserSitesTableDataSource,
    UsersInErrorTableDataSource,
  ],
})

export class UsersModule {
}
