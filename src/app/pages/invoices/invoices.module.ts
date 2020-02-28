import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { InvoicesComponent } from './invoices.component';
import { InvoicesRoutes } from './invoices.routing';
import { InvoicesListComponent } from './list/invoices-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(InvoicesRoutes),
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    AddressModule,
    TableModule,
    DialogsModule,
    CommonDirectivesModule,
    FormattersModule,
  ],
  declarations: [
    InvoicesComponent,
    InvoicesListComponent,
  ],
  entryComponents: [
  ],
  exports: [
  ],
  providers: [
  ],
})

export class InvoicesModule {
}
