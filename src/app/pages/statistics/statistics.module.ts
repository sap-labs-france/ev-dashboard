import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { TableModule } from '../../shared/table/table.module';
import { StatisticsConsumptionComponent } from './consumption/statistics-consumption.component';
import { StatisticsInactivityComponent } from './inactivity/statistics-inactivity.component';
import { StatisticsPricingComponent } from './pricing/statistics-pricing.component';
import { StatisticsBuildService } from './shared/statistics-build.service';
import { StatisticsExportService } from './shared/statistics-export.service';
import { StatisticsFiltersComponent } from './shared/statistics-filters.component';
import { StatisticsComponent } from './statistics.component';
import { StatisticsRoutes } from './statistics.routing';
import { StatisticsTransactionsComponent } from './transactions/statistics-transactions.component';
import { StatisticsUsageComponent } from './usage/statistics-usage.component';

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
    DialogsModule,
    NgxDaterangepickerMd,
  ],
  declarations: [
    StatisticsComponent,
    StatisticsConsumptionComponent,
    StatisticsUsageComponent,
    StatisticsInactivityComponent,
    StatisticsTransactionsComponent,
    StatisticsPricingComponent,
    StatisticsFiltersComponent,
  ],
  exports: [],
  providers: [StatisticsBuildService, StatisticsExportService],
})
export class StatisticsModule {}
