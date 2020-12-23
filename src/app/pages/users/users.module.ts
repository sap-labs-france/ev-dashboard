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
import { AppFormatTagStatusPipe, TagStatusFormatterComponent } from './formatters/tag-status-formatter.component';
import { AppUserRolePipe } from './formatters/user-role.pipe';
import { AppFormatUserStatusPipe, UserStatusFormatterComponent } from './formatters/user-status-formatter.component';
import { AppUserStatusPipe } from './formatters/user-status.pipe';
import { UsersInErrorTableDataSource } from './in-error/users-in-error-table-data-source';
import { UsersInErrorComponent } from './in-error/users-in-error.component';
import { UsersListComponent } from './list/users-list.component';
import { TagComponent } from './tag/tag.component';
import { TagDialogComponent } from './tag/tag.dialog.component';
import { TagsListComponent } from './tags/tags-list.component';
import { UserSitesAdminCheckboxComponent } from './user-sites/user-sites-admin-checkbox.component';
import { UserSitesDialogComponent } from './user-sites/user-sites-dialog.component';
import { UserSitesOwnerRadioComponent } from './user-sites/user-sites-owner-radio.component';
import { UserSitesTableDataSource } from './user-sites/user-sites-table-data-source';
import { UserComponent } from './user/user.component';
import { UserDialogComponent } from './user/user.dialog.component';
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
    TagStatusFormatterComponent,
    AppFormatUserStatusPipe,
    AppFormatTagStatusPipe,
    UsersListComponent,
    TagsListComponent,
    UsersInErrorComponent,
    UsersComponent,
    UserComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserSitesAdminCheckboxComponent,
    ConcurUserConnectionComponent,
    AppUserRolePipe,
    AppUserStatusPipe,
    UserSitesOwnerRadioComponent,
    TagDialogComponent,
    TagComponent,
  ],
  entryComponents: [
    UserStatusFormatterComponent,
    TagStatusFormatterComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserSitesAdminCheckboxComponent,
    ErrorCodeDetailsComponent,
    UserSitesOwnerRadioComponent,
    TagDialogComponent,
    TagComponent
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
