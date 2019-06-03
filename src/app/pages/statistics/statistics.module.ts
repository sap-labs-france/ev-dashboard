import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { MaterialModule } from '../../app.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { ComponentModule } from '../../shared/component/component.module';
import { TableModule } from '../../shared/table/table.module';

import { StatisticsRoutes } from './statistics.routing';
import { StatisticsComponent } from './statistics.component';
import { StatisticsConsumptionComponent } from '../statistics/consumption/statistics-consumption.component';
import { StatisticsUsageComponent } from '../statistics/usage/statistics-usage.component';
import { StatisticsFiltersComponent } from '../statistics/shared/statistics-filters.component';
import { StatisticsBuildService } from './shared/statistics-build.service';

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
    TableModule,
    DialogsModule
  ],
  declarations: [
    StatisticsComponent,
    StatisticsConsumptionComponent,
    StatisticsUsageComponent,
    StatisticsFiltersComponent
  ],
  exports: [
  ],
  entryComponents: [
  ],
  providers: [
    StatisticsBuildService
  ]
})

export class StatisticsModule {
}
