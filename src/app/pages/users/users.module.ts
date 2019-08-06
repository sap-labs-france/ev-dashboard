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
import { UserConnectionComponent } from './connections/user-connection.component';
import { UserRolePipe } from './formatters/user-role.pipe';
import { AppFormatUserStatusPipe, UserStatusComponent } from './formatters/user-status.component';
import { UserStatusPipe } from './formatters/user-status.pipe';
import { UsersInErrorTableDataSource } from './in-error/users-in-error-table-data-source';
import { UserComponent } from './user/user.component';
import { UserDialogComponent } from './user/user.dialog.component';
import { UserRoutes } from './users.routing';
import { UsersListComponent } from './list/users-list.component';
import { UsersListTableDataSource } from 'app/shared/dialogs/users/users-data-source-table';
import { UsersComponent } from './users.component';
import { UsersInErrorComponent } from './in-error/users-in-error.component';
import { UserSitesDialogComponent } from './user-sites/user-sites-dialog.component';
import { UserSitesTableDataSource } from './user-sites/user-sites-table-data-source';

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
    UsersListComponent,
    UsersInErrorComponent,
    UsersComponent,
    UserComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserConnectionComponent,
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
    UserSitesTableDataSource,
    UsersListTableDataSource,
    UsersInErrorTableDataSource
  ]
})

export class UsersModule {
}
