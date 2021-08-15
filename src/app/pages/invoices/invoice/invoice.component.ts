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
  public isPayClicked: boolean;
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
    private stripeService: StripeService,
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
    this.isPayClicked = false;
    // this.amount = '23';
    // this.to = this.translateService.instant('invoices.to');
  }

  public ngOnInit() {
    this.spinnerService.show();
    this.centralServerService.getInvoice(this.currentInvoiceID).subscribe((invoice) => {
      this.isPaid = invoice.status === BillingInvoiceStatus.PAID;
      this.invoiceNumber = invoice.number;
      if (!this.isPaid) {
        this.amount = this.appCurrencyPipe.transform(invoice.amount / 100, invoice.currency.toUpperCase());
        this.invoicePaymentComponent.setCurrentAmount(this.amount);
      }
    });
    this.centralServerService.getInvoicePdf(this.currentInvoiceID).subscribe((invoice) => {
      this.pdfSrc = {
        data : new Uint8Array(invoice),
      };
      this.spinnerService.hide();
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

  // public pageRendered() {
  //   this.pdfComponent.pdfViewer.currentScaleValue = 'page-fit';
  // }

  // ngOnInit() {
  //   if (this.type == 'pdf') {
  //     this.pdfLink = `${environment.celoApiEndpoint}/api/Consents/${this.id}`
  //   } else if (this.type == 'document') {
  //     this.pdfLink = `${environment.celoApiEndpoint}/api/PatientFiles/${this.id}`
  //   }
  //   this.loadPdf()
  // }

  // private loadPdf() {
  //   this.isLoading = true
  //   this.http.get<ArrayBuffer>(this.pdfLink, {responseType: 'arraybuffer' as 'json'})
  //     .do(()=>this.isLoading=false)
  //     .subscribe((ab) => {
  //       this.pdfSource = {
  //         data: new Uint8Array(ab)
  //       }
  //     })
  // }

  public onClose() {
    this.closeDialog(true);
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  // // Create the dialog
  // const dialogConfig = new MatDialogConfig();
  // // Popup Width
  // dialogConfig.minWidth = size?.minWidth ? size.minWidth + 'vw' : '80vw';
  // dialogConfig.maxWidth = size?.maxWidth ? size.maxWidth + 'vw' : dialogConfig.maxWidth;
  // dialogConfig.width = size?.width ? size.width + 'vw' : dialogConfig.width;
  // // Popup Height
  // dialogConfig.minHeight = size?.minHeight ? size.minHeight + 'vh' : '60vh';
  // dialogConfig.maxHeight = size?.maxHeight ? size.maxHeight + 'vh' : dialogConfig.maxHeight;
  // dialogConfig.height = size?.height ? size.height + 'vh' : dialogConfig.height;
  // // CSS
  // dialogConfig.panelClass = 'transparent-dialog-container';
  // dialogConfig.data = {
  //   ...dialogParams,
  // };
  // // disable outside click close
  // dialogConfig.disableClose = true;
  // // Open
  // const dialogRef = dialog.open(component, dialogConfig);
  // dialogRef.afterClosed().subscribe(() => {
  //   if (refresh) {
  //     refresh().subscribe();
  //   }
  // });


  public openInvoiceDialog() {
    this.isPayClicked = true;
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
      console.log('TOTO');
    });
  }

  // public payInvoice() {
  //   // new TablePayInvoiceAction().getActionDef().action()
  //   void this.doCreatePaymentMethod();
  // }

  private async doCreatePaymentMethod() {
    // const operationResult: any = await this.createPaymentMethod();
    // if (operationResult.error) {
    //   // Operation failed
    //   if (operationResult.error.code === 'card_declined') {
    //     this.isCardNumberValid = false;
    //     this.messageService.showErrorMessage('settings.billing.payment_methods_create_error_card_declined');
    //     this.cardNumberError = this.translateService.instant('settings.billing.payment_methods_card_declined');
    //     this.cardNumber.focus();
    //   } else {
    //     this.messageService.showErrorMessage('settings.billing.payment_methods_create_error');
    //   }
    //   this.isSaveClicked = false;
    // } else {
    //   this.spinnerService.hide();
    //   // Operation succeeded
    //   this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', { last4: operationResult.internalData.card.last4 });
    //   // this.close(true);
    // }
  }
}
