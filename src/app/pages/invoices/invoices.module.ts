import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import {
  AppFormatInvoiceStatusPipe,
  InvoiceStatusFormatterComponent,
} from './formatters/invoice-status-formatter.component';
import {
  AppFormatTransferStatusPipe,
  TransferStatusFormatterComponent,
} from './formatters/transfer-status-formatter.component';
import { InvoicesComponent } from './invoices.component';
import { InvoicesRoutes } from './invoices.routing';
import { InvoicesListComponent } from './list/invoices-list.component';
import { InvoicesTableDataSource } from './list/invoices-table-data-source';
import { TransfersListComponent } from './transfers/transfers-list.component';

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
    RouterModule.forChild(InvoicesRoutes),
  ],
  declarations: [
    InvoicesComponent,
    InvoicesListComponent,
    InvoiceStatusFormatterComponent,
    TransfersListComponent,
    TransferStatusFormatterComponent,
    AppFormatInvoiceStatusPipe,
    AppFormatTransferStatusPipe,
  ],
  providers: [InvoicesTableDataSource],
})
export class InvoicesModule {}
