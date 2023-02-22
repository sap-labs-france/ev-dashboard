import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-scan-pay-invoice',
  templateUrl: 'scan-pay-invoice.component.html',
})
export class ScanPayInvoiceComponent implements OnInit {
  public isBillingComponentActive: boolean;
  public token: string;
  public invoiceID: string;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    public translateService: TranslateService,
    public activatedRoute: ActivatedRoute,
    public windowService: WindowService,) {
    this.isBillingComponentActive = true; // comment on gere ça ??
    this.invoiceID = this.activatedRoute?.snapshot?.params['invoiceID'];
  }

  public ngOnInit(): void {
    try {
      this.spinnerService.show();
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_payment_intend');
    } finally {
      this.spinnerService.hide();
    }
    // void this.initialize();
  }

  // private async initialize(): Promise<void> {
  //   try {
  //     this.spinnerService.show();
  //     const toto = this.centralServerService.downloadInvoice(this.invoiceID).subscribe({
  //       next: (result) => {
  //         this.spinnerService.show();
  //         FileSaver.saveAs(result, 'invoice_' + this.invoiceID + '.pdf');
  //         this.spinnerService.hide();
  //       },
  //       error: () => {
  //         this.spinnerService.hide();
  //         this.messageService.showErrorMessage('invoices.failed_download');
  //       }
  //     });
  //   } catch (error) {
  //     Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_payment_intend');
  //   } finally {
  //     this.spinnerService.hide();
  //   }
  // }
}
