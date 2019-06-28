import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { TableModule } from '../../shared/table/table.module';

import { StatisticsConsumptionComponent } from '../statistics/consumption/statistics-consumption.component';
import { StatisticsInactivityComponent } from '../statistics/inactivity/statistics-inactivity.component';
import { StatisticsFiltersComponent } from '../statistics/shared/statistics-filters.component';
import { StatisticsUsageComponent } from '../statistics/usage/statistics-usage.component';
import { StatisticsBuildService } from './shared/statistics-build.service';
import { StatisticsExportService } from './shared/statistics-export.service';
import { StatisticsComponent } from './statistics.component';
import { StatisticsRoutes } from './statistics.routing';

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
    StatisticsInactivityComponent,
    StatisticsFiltersComponent
  ],
  exports: [
  ],
  entryComponents: [
  ],
  providers: [
    StatisticsBuildService,
    StatisticsExportService
  ]
})

export class StatisticsModule {
}
