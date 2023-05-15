import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { TRANSACTION_INVOICE_STATUS } from '../../../shared/model/transactions-invoices.model';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { BillingInvoice, BillingInvoiceStatus } from '../../../types/Billing';
import { ChipType } from '../../../types/GlobalType';

@Component({
  selector: 'app-invoice-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatInvoiceStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatInvoiceStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class InvoiceStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: BillingInvoice;
}

@Pipe({ name: 'appFormatInvoiceStatus' })
export class AppFormatInvoiceStatusPipe implements PipeTransform {
  public transform(invoiceStatus: BillingInvoiceStatus, type: string): string {
    if (type === 'class') {
      return this.buildInvoiceStatusClasses(invoiceStatus);
    }
    if (type === 'text') {
      return this.buildInvoiceStatusText(invoiceStatus);
    }
    return '';
  }

  public buildInvoiceStatusClasses(invoiceStatus: BillingInvoiceStatus): string {
    let classNames = 'chip-width-8em ';
    switch (invoiceStatus) {
      case BillingInvoiceStatus.PAID:
        classNames += ChipType.SUCCESS;
        break;
      case BillingInvoiceStatus.DELETED:
      case BillingInvoiceStatus.VOID:
        classNames += ChipType.WARNING;
        break;
      case BillingInvoiceStatus.UNCOLLECTIBLE:
      case BillingInvoiceStatus.OPEN:
        classNames += ChipType.DANGER;
        break;
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildInvoiceStatusText(status: string): string {
    for (const invoiceStatus of TRANSACTION_INVOICE_STATUS) {
      if (invoiceStatus.key === status) {
        return invoiceStatus.value;
      }
    }
    return '';
  }
}
