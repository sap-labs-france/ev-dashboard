import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {LogsComponent} from './logs.component';
import {LogsRoutes} from './logs.routing';
import {TableModule} from '../../shared/table/table.module';
import {CommonDirectivesModule} from '../../shared/directives/common-directives.module';
import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {LogLevelComponent} from './formatters/log-level.component';
import {AppFormatLogLevelPipe} from './formatters/log-level.component';
import {ComponentModule} from '../../shared/component/component.module';
import { LogsDataSource } from './logs-data-source-table';


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
    DialogsModule
  ],
  declarations: [
    LogsComponent,
    LogLevelComponent,
    AppFormatLogLevelPipe
  ],
  entryComponents: [
    LogLevelComponent
  ],
  providers: [
    LogsDataSource
  ]
})

export class LogsModule {
}
