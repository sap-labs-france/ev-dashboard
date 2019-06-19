import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { ConnectionComponent } from './connections/connection.component';
import { UserRolePipe } from './formatters/user-role.pipe';
import { AppFormatUserStatusPipe } from './formatters/user-status.component';
import { UserStatusComponent } from './formatters/user-status.component';
import { UserStatusPipe } from './formatters/user-status.pipe';
import { UserSitesDataSource } from './user/user-sites-data-source-table';
import { UserSitesDialogComponent } from './user/user-sites.dialog.component';
import { UserComponent } from './user/user.component';
import { UserDialogComponent } from './user/user.dialog.component';
import { UsersDataSource } from './users-data-source-table';
import { UsersInErrorDataSource } from './users-in-error-data-source-table';
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
    FormattersModule
  ],
  declarations: [
    UserStatusComponent,
    AppFormatUserStatusPipe,
    UsersComponent,
    UserComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    ConnectionComponent,
    UserRolePipe,
    UserStatusPipe
  ],
  entryComponents: [
    UserStatusComponent,
    UserDialogComponent,
    UserSitesDialogComponent
  ],
  exports: [
    UserRolePipe,
    UserStatusPipe,
    UserDialogComponent
  ],
  providers: [
    UserRolePipe,
    UserStatusPipe,
    UserSitesDataSource,
    UsersDataSource,
    UsersInErrorDataSource
  ]
})

export class UsersModule {
}
