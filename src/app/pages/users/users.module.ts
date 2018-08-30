import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { UserComponent } from './user/user.component';
import { UserRoutes } from './users.routing';
import { AddressModule } from '../../shared/address/address.module';
import { TableModule } from '../../shared/table/table.module';
import { CommonDirectivesModule } from '../../directives/common-directives.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UserRoutes),
        ReactiveFormsModule,
        TranslateModule,
        MaterialModule,
        AddressModule,
        TableModule,
        CommonDirectivesModule
    ],
    declarations: [
        UserComponent
    ]
})

export class UsersModule {}
