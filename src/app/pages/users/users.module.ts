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
    CommonDirectivesModule
  ],
  declarations: [
    UserComponent
  ]
})

export class UsersModule {
}
