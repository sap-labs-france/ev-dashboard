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

  constructor(
    public invoicesListTableDataSource: InvoicesTableDataSource,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    public windowService: WindowService,
    public messageService: MessageService
  ) {
  }

  public ngOnInit() {
    const invoiceID = this.windowService.getSearch('InvoiceID');
    if (invoiceID) {
      this.centralServerService.downloadInvoice(invoiceID).subscribe((result) => {
        this.spinnerService.show();
        FileSaver.saveAs(result, 'invoice.pdf');
        this.spinnerService.hide();
      }, () => {
        this.spinnerService.hide();
        this.messageService.showErrorMessage('invoices.failed_download');
      });
    }
  }
}
