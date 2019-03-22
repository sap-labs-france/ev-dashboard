import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {UserComponent} from './user/user.component';
import {UserRoutes} from './users.routing';
import {AddressModule} from '../../shared/address/address.module';
import {TableModule} from '../../shared/table/table.module';
import {CommonDirectivesModule} from '../../shared/directives/common-directives.module';
import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {UsersComponent} from './users.component';
import {UserRolePipe} from './formatters/user-role.pipe';
import {UserStatusPipe} from './formatters/user-status.pipe';
import {FormattersModule} from '../../shared/formatters/formatters.module';
import {UserDialogComponent} from './user/user.dialog.component';
import {UserStatusComponent} from './formatters/user-status.component';
import {UserSitesDialogComponent} from './user/user-sites.dialog.component';

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
    UsersComponent,
    UserComponent,
    UserDialogComponent,
    UserSitesDialogComponent,
    UserRolePipe,
    UserStatusPipe
  ],
  entryComponents: [
    UserStatusComponent,
    UserDialogComponent,
    UserSitesDialogComponent
  ],
  exports: [
    UserDialogComponent
  ],
  providers: [
    UserRolePipe,
    UserStatusPipe,
    UserComponent
  ]
})

export class UsersModule {
}
