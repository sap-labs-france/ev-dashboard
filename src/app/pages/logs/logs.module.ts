import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { TableModule } from '../../shared/table/table.module';
import {
  AppFormatLogLevelPipe,
  LogLevelFormatterComponent,
} from './formatters/log-level-formatter.component';
import { LogsListTableDataSource } from './list/logs-list-table-data-source';
import { LogsListComponent } from './list/logs-list.component';
import { LogsRoutes } from './logs.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(LogsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    ComponentModule,
    CommonDirectivesModule,
    DialogsModule,
  ],
  declarations: [LogsListComponent, LogLevelFormatterComponent, AppFormatLogLevelPipe],
  providers: [LogsListTableDataSource],
})
export class LogsModule {}
