import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'shared/charts/chart.module';
import { FiltersModule } from 'shared/filters/filters.module';

import { MaterialModule } from '../../app.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';
import { DashboardChartListComponent } from './list-charts/dashboard-list-charts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FiltersModule,
    ChartModule,
    RouterModule.forChild(DashboardRoutes),
  ],
  declarations: [
    DashboardComponent,
    DashboardChartListComponent
  ],
  entryComponents: [
  ],
  providers: [
  ],
})
export class DashboardModule {
}
