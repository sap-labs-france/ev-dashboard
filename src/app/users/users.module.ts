import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationGuard } from '../authentication/authentication-guard';
import { MaterialModule } from '../app.module';
import { AutofocusDirective } from '../directives/auto-focus.directive';
import { UserComponent } from './user/user.component';
import { UserRoutes } from './users.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UserRoutes),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        MaterialModule
    ],
    declarations: [
        UserComponent,
        AutofocusDirective
    ],
    providers: [
        AuthenticationGuard
    ]
})

export class UsersModule {}
