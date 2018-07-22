import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationGuard } from '../authentication/authentication-guard';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        TranslateModule,
        FormsModule,
    ],
    declarations: [
        DashboardComponent
    ],
    providers: [
        AuthenticationGuard
    ]
})

export class DashboardModule { }
