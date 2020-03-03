import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { User, UserStatus } from 'app/types/User';
import { BillingInvoice, InvoiceStatus } from '../../../types/Billing';
import { invoicesStatuses } from '../model/invoices.model';

@Component({
  selector: 'app-invoice-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatInvoiceStatus:'class'" [disabled]="true">
        {{row.status | appFormatInvoiceStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class InvoiceStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: BillingInvoice;
}

@Pipe({name: 'appFormatInvoiceStatus'})
export class AppFormatInvoiceStatusPipe implements PipeTransform {
  transform(invoiceStatus: string, type: string): string {
    if (type === 'class') {
      return this.buildInvoiceStatusClasses(invoiceStatus);
    }
    if (type === 'text') {
      return this.buildInvoiceStatusText(invoiceStatus);
    }
    return '';
  }

  buildInvoiceStatusClasses(status: string): string {
    let classNames = 'chip-width-5em ';
    switch (status) {
      case InvoiceStatus.PAID:
        classNames += ChipType.SUCCESS;
        break;
      case InvoiceStatus.UNPAID:
        classNames += ChipType.DANGER;
        break;
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  buildInvoiceStatusText(status: string): string {
    for (const invoiceStatus of invoicesStatuses) {
      if (invoiceStatus.key === status) {
        return invoiceStatus.value;
      }
    }
    return '';
  }
}
