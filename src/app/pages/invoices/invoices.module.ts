import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AppFormatInvoiceStatusPipe, InvoiceStatusFormatterComponent } from './formatters/invoice-status-formatter.component';
import { InvoicePaymentComponent } from './invoice/invoice-payment/invoice-payment.component';
import { InvoicePaymentDialogComponent } from './invoice/invoice-payment/invoice-payment.dialog.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceDialogComponent } from './invoice/invoice.dialog.component';
import { InvoiceMainComponent } from './invoice/main/invoice-main.component';
import { InvoicePreviewComponent } from './invoice/preview/invoice-preview.component';
import { InvoiceSessionsComponent } from './invoice/sessions/invoice-sessions.component';
import { InvoicesComponent } from './invoices.component';
import { InvoicesRoutes } from './invoices.routing';
import { InvoicesListComponent } from './list/invoices-list.component';
import { InvoicesTableDataSource } from './list/invoices-table-data-source';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AddressModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    FormattersModule,
    RouterModule.forChild(InvoicesRoutes),
  ],
  declarations: [
    InvoicesComponent,
    InvoicesListComponent,
    InvoiceStatusFormatterComponent,
    AppFormatInvoiceStatusPipe,
    InvoiceComponent,
    InvoiceMainComponent,
    InvoiceSessionsComponent,
    InvoicePreviewComponent,
    InvoiceDialogComponent,
    InvoicePaymentComponent,
    InvoicePaymentDialogComponent,
  ],
  entryComponents: [
    InvoicesComponent,
    InvoicesListComponent,
    InvoiceStatusFormatterComponent,
    InvoiceComponent,
    // InvoiceDialogComponent,
  ],
  providers: [
    InvoicesTableDataSource,
    InvoicePaymentComponent
  ],
})

export class InvoicesModule {
}
