import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import * as FileSaver from 'file-saver';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { StripeService } from 'services/stripe.service';
import { AppCurrencyPipe } from 'shared/formatters/app-currency.pipe';
import { BillingInvoiceStatus } from 'types/Billing';
import { ScreenSize } from 'types/GlobalType';
import TenantComponents from 'types/TenantComponents';
import { Utils } from 'utils/Utils';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SpinnerService } from '../../../services/spinner.service';
import { InvoicesTableDataSource } from '../list/invoices-table-data-source';
import { InvoicePaymentComponent } from './invoice-payment/invoice-payment.component';
import { InvoicePaymentDialogComponent } from './invoice-payment/invoice-payment.dialog.component';

@Component({
  selector: 'app-invoice',
  templateUrl: 'invoice.component.html'
})
export class InvoiceComponent implements OnInit {
  @Input() public currentInvoiceID!: string;
  @Input() public currentUserID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  @ViewChild(PdfViewerComponent, {static: false})
  // @ViewChild('child') public child: InvoicePaymentComponent;


  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public userID!: AbstractControl;
  public active!: AbstractControl;
  public default!: AbstractControl;
  public visualID!: AbstractControl;

  public pdfSrc: any;
  public isAdmin = false;
  public isBillingComponentActive: any;
  public acceptConditions: AbstractControl;
  // Stripe elements
  public elements: StripeElements;
  public cardNumber: StripeCardNumberElement;
  public expirationDate: StripeCardExpiryElement;
  public cvc: StripeCardCvcElement;
  // Errors
  public cardNumberError: string;
  public expirationDateError: string;
  public cvcError: string;

  public hasAcceptedConditions: boolean;
  public isCardNumberValid: boolean;
  public isExpirationDateValid: boolean;
  public isCvcValid: boolean;
  public amount: string;
  public invoiceStatus: BillingInvoiceStatus;
  public isPaid: boolean;
  public invoiceNumber: string;

  public constructor(
    public invoicesTableDataSource: InvoicesTableDataSource,
    public invoicePaymentComponent: InvoicePaymentComponent,
    public spinnerService: SpinnerService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private appCurrencyPipe: AppCurrencyPipe,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.hasAcceptedConditions = false;
    this.isCardNumberValid = false;
    this.isExpirationDateValid = false;
    this.isCvcValid = false;
  }

  public ngOnInit() {
    this.spinnerService.show();
    this.loadInvoice();
    this.centralServerService.getInvoicePdf(this.currentInvoiceID).subscribe((invoice) => {
      this.pdfSrc = {
        data : new Uint8Array(invoice),
      };
      this.spinnerService.hide();
    });
  }

  public loadInvoice() {
    this.centralServerService.getInvoice(this.currentInvoiceID).subscribe((invoice) => {
      this.isPaid = invoice.status === BillingInvoiceStatus.PAID;
      this.invoiceNumber = invoice.number;
      if (!this.isPaid) {
        this.amount = this.appCurrencyPipe.transform(invoice.amount / 100, invoice.currency.toUpperCase());
        this.invoicePaymentComponent.setCurrentAmount(this.amount);
      }
    });
  }

  public downloadInvoice() {
    this.spinnerService.show();
    this.centralServerService.downloadInvoice(this.currentInvoiceID).subscribe((result) => {
      FileSaver.saveAs(result, 'invoice_' + (this.invoiceNumber ?? this.currentInvoiceID) + '.pdf');
      this.spinnerService.hide();
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService,
        this.centralServerService, this.translateService.instant('invoices.cannot_download_invoice'));
    });
  }

  public close() {
    if (this.inDialog) {
      this.dialogRef.close(true);
    }
  }

  public openInvoicePaymentDialog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = ScreenSize.S + 'vw';
    dialogConfig.maxWidth = ScreenSize.M + 'vw';
    dialogConfig.width = ScreenSize.S + 'vw';
    dialogConfig.minHeight = ScreenSize.M + 'vh';
    dialogConfig.maxHeight = ScreenSize.XL + 'vh';
    dialogConfig.height = ScreenSize.XL + 'vh';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = { dialogData: {
      id: this.currentInvoiceID,
      currentUserID: this.currentUserID,
      amountWithCurrency: this.amount
    }};
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(InvoicePaymentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      this.loadInvoice();
    });
  }
}
