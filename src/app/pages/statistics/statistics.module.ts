import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {StatisticsComponent} from './statistics.component';
import {StatisticsRoutes} from './statistics.routing';
import {CommonDirectivesModule} from '../../shared/directives/common-directives.module';
// import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {ComponentModule} from '../../shared/component/component.module';

import {StatisticsConsumptionComponent} from '../statistics/consumption/statistics-consumption.component';
import {StatisticsUsageComponent} from '../statistics/usage/statistics-usage.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(StatisticsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    ComponentModule,
    CommonDirectivesModule,
//    DialogsModule
  ],
  declarations: [
    StatisticsComponent,
    StatisticsConsumptionComponent,
    StatisticsUsageComponent
],
  entryComponents: [
  ],
  providers: []
})

export class StatisticsModule {
}
