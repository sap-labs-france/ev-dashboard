import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { AppCurrencyPipe } from 'shared/formatters/app-currency.pipe';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { BillingInvoice, BillingInvoiceStatus } from 'types/Billing';
import { Image } from 'types/GlobalType';
import { Constants } from 'utils/Constants';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SpinnerService } from '../../../services/spinner.service';
import { InvoicesTableDataSource } from '../list/invoices-table-data-source';
import { InvoicePaymentComponent } from './invoice-payment/invoice-payment.component';
import { InvoiceMainComponent } from './main/invoice-main.component';

@Component({
  selector: 'app-invoice',
  templateUrl: 'invoice.component.html'
})
export class InvoiceComponent implements OnInit {
  @Input() public currentInvoiceID!: string;
  @Input() public currentUserID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  @ViewChild('invoiceMainComponent') public invoiceMainComponent!: InvoiceMainComponent;

  public formGroup!: FormGroup;
  public invoice!: BillingInvoice;
  public userImage = Constants.USER_NO_PICTURE;
  // public id!: AbstractControl;
  // public description!: AbstractControl;
  // public userID!: AbstractControl;
  // public active!: AbstractControl;
  // public default!: AbstractControl;
  // public visualID!: AbstractControl;

  // // public pdfSrc: any;
  // public acceptConditions: AbstractControl;
  // // Stripe elements
  // public elements: StripeElements;
  // public cardNumber: StripeCardNumberElement;
  // public expirationDate: StripeCardExpiryElement;
  // public cvc: StripeCardCvcElement;
  // // Errors
  // public cardNumberError: string;
  // public expirationDateError: string;
  // public cvcError: string;

  // public hasAcceptedConditions: boolean;
  // public isCardNumberValid: boolean;
  // public isExpirationDateValid: boolean;
  // public isCvcValid: boolean;
  // public amount: string;
  // public invoiceStatus: BillingInvoiceStatus;
  // public isPaid: boolean;
  // public invoiceNumber: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    // public invoicesTableDataSource: InvoicesTableDataSource,
    // public invoicePaymentComponent: InvoicePaymentComponent,
    // private authorizationService: AuthorizationService,
    // private componentService: ComponentService,
    // private appCurrencyPipe: AppCurrencyPipe,
    // private messageService: MessageService,
    // private translateService: TranslateService,
    // private router: Router,
    // private dialog: MatDialog
    private datePipe: AppDatePipe,
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService) {
    // this.hasAcceptedConditions = false;
    // this.isCardNumberValid = false;
    // this.isExpirationDateValid = false;
    // this.isCvcValid = false;
  }

  public ngOnInit() {
    this.formGroup = new FormGroup({});
    this.spinnerService.show();
    this.loadInvoice();
    // this.centralServerService.getInvoicePdf(this.currentInvoiceID).subscribe((invoice) => {
    //   this.pdfSrc = {
    //     data : new Uint8Array(invoice),
    //   };
    // });
    this.spinnerService.hide();
  }

  public loadInvoice() {
    this.centralServerService.getInvoice(this.currentInvoiceID).subscribe((invoice) => {
      this.invoice = invoice;

      // Load User's image
      if (this.userImage === Constants.USER_NO_PICTURE && this.invoice.userID) {
        this.centralServerService.getUserImage(this.invoice.userID).subscribe((userImage: Image) => {
          if (userImage && userImage.image) {
            this.userImage = userImage.image.toString();
          }
        });
      }
      // this.isPaid = invoice.status === BillingInvoiceStatus.PAID;
      // this.invoiceNumber = invoice.number;
      // if (!this.isPaid) {
      //   this.amount = this.appCurrencyPipe.transform(invoice.amount / 100, invoice.currency.toUpperCase());
      //   this.invoicePaymentComponent.setCurrentAmount(this.amount);
      // }
    });
  }

  // public downloadInvoice() {
  //   this.spinnerService.show();
  //   this.centralServerService.downloadInvoice(this.currentInvoiceID).subscribe((result) => {
  //     FileSaver.saveAs(result, 'invoice_' + (this.invoiceNumber ?? this.currentInvoiceID) + '.pdf');
  //     this.spinnerService.hide();
  //   }, (error) => {
  //     this.spinnerService.hide();
  //     Utils.handleHttpError(error, this.router, this.messageService,
  //       this.centralServerService, this.translateService.instant('invoices.cannot_download_invoice'));
  //   });
  // }

  public close() {
    if (this.inDialog) {
      this.dialogRef.close(true);
    }
  }

  // public openInvoicePaymentDialog() {
  //   // Create the dialog
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.minWidth = ScreenSize.S + 'vw';
  //   dialogConfig.maxWidth = ScreenSize.M + 'vw';
  //   dialogConfig.width = ScreenSize.S + 'vw';
  //   dialogConfig.minHeight = ScreenSize.M + 'vh';
  //   dialogConfig.maxHeight = ScreenSize.XL + 'vh';
  //   dialogConfig.height = ScreenSize.XL + 'vh';
  //   dialogConfig.disableClose = false;
  //   dialogConfig.panelClass = 'transparent-dialog-container';
  //   // Set data
  //   dialogConfig.data = { dialogData: {
  //     id: this.currentInvoiceID,
  //     currentUserID: this.currentUserID,
  //     amountWithCurrency: this.amount
  //   }};
  //   // Disable outside click close
  //   dialogConfig.disableClose = true;
  //   // Open
  //   const dialogRef = this.dialog.open(InvoicePaymentDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.loadInvoice();
  //   });
  // }
}
