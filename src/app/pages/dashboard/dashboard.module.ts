import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MdModule } from '../../md/md.module';
import { MaterialModule } from '../../app.module';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        TranslateModule,
        MdModule,
        MaterialModule
    ],
    declarations: [
        DashboardComponent
    ]
})

export class DashboardModule { }
