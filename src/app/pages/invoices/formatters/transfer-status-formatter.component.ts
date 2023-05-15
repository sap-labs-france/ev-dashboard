import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { TRANSFER_STATUS } from '../../../shared/model/transfers-status.model';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { BillingTransfer, BillingTransferStatus } from '../../../types/Billing';
import { ChipType } from '../../../types/GlobalType';

@Component({
  selector: 'app-transfer-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatTransferStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatTransferStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class TransferStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: BillingTransfer;
}

@Pipe({ name: 'appFormatTransferStatus' })
export class AppFormatTransferStatusPipe implements PipeTransform {
  public transform(transferStatus: BillingTransferStatus, type: string): string {
    if (type === 'class') {
      return this.buildTransferStatusClasses(transferStatus);
    }
    if (type === 'text') {
      return this.buildTransferStatusText(transferStatus);
    }
    return '';
  }

  public buildTransferStatusClasses(status: BillingTransferStatus): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case BillingTransferStatus.PENDING:
        classNames += ChipType.WARNING;
        break;
      case BillingTransferStatus.DRAFT:
        classNames += ChipType.GREY;
        break;
      case BillingTransferStatus.FINALIZED:
        classNames += ChipType.DEFAULT;
        break;
      case BillingTransferStatus.TRANSFERRED:
      default:
        classNames += ChipType.SUCCESS;
    }
    return classNames;
  }

  public buildTransferStatusText(status: string): string {
    for (const transferStatus of TRANSFER_STATUS) {
      if (transferStatus.key === status) {
        return transferStatus.value;
      }
    }
    return '';
  }
}
