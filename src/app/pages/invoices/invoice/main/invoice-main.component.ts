import { AfterContentInit, AfterViewInit, Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CentralServerService } from 'services/central-server.service';
import { BillingInvoice } from 'types/Billing';

@Component({
  selector: 'app-invoice-main',
  templateUrl: 'invoice-main.component.html'
})
export class InvoiceMainComponent implements OnInit, AfterContentInit {
  @Input() public formGroup: FormGroup;
  @Input() public invoice: BillingInvoice;
  @Input() public userImage!: string;

  public invoiceNumber: string;
  public invoiceAmount = 0;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService) {
  }

  public ngOnInit() {
  }

  public ngAfterContentInit() {
    setTimeout(() => {
      if (this.invoice) {
        this.invoiceNumber = this.invoice.number || 'N/A';
        this.invoiceAmount = this.invoice.amount / 100;
      }
    }, 0);
  }
}
