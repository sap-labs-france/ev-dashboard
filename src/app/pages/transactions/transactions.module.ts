import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {TransactionsComponent} from './transactions.component';
import {TransactionsRoutes} from './transactions.routing';
import {TableModule} from '../../shared/table/table.module';
import {CommonDirectivesModule} from '../../directives/common-directives.module';
import {DialogsModule} from '../../shared/dialogs/dialogs.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TransactionsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule
  ],
  declarations: [
    TransactionsComponent
  ],
  entryComponents: [
    TransactionsComponent
  ],
  exports: [
    TransactionsComponent
  ]
})

export class TransactionsModule {
}
