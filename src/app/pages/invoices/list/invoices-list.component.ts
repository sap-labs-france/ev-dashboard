import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { InvoicesComponent } from '../invoices.component';
import { InvoicesTableDataSource } from './invoices-table-data-source';

@Component({
  selector: 'app-invoices-list',
  template: '<app-table [dataSource]="invoicesListTableDataSource"></app-table>',
  providers: [InvoicesTableDataSource, InvoicesComponent],
})
export class InvoicesListComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public invoicesListTableDataSource: InvoicesTableDataSource,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    public windowService: WindowService,
    public messageService: MessageService
  ) {}

  // Download from email
  public ngOnInit() {
    const invoiceID = this.windowService.getUrlParameterValue('InvoiceID');
    if (invoiceID) {
      const invoiceNumber = this.windowService.getUrlParameterValue('InvoiceNumber');
      this.centralServerService.downloadInvoice(invoiceID).subscribe({
        next: (result) => {
          this.spinnerService.show();
          FileSaver.saveAs(result, 'invoice_' + (invoiceNumber ?? invoiceID) + '.pdf');
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
          this.messageService.showErrorMessage('invoices.failed_download');
        },
      });
    }
  }
}
