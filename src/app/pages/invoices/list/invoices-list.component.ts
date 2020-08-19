import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { WindowService } from 'app/services/window.service';
import * as FileSaver from 'file-saver';

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
    public windowService: WindowService
  ) {
  }

  public ngOnInit() {
    const invoiceID = this.windowService.getSearch('invoiceID');
    if (invoiceID) {
      console.log(invoiceID);
      this.centralServerService.downloadInvoice(invoiceID).subscribe(async (result) => {
        this.spinnerService.show();
        FileSaver.saveAs(result, 'invoice.pdf');
      }, (error) => {
        this.spinnerService.hide();
      });
    } else {
      console.log('no');
    }
  }
}
