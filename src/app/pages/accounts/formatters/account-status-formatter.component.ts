import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ACCOUNT_STATUS } from 'shared/model/account-status.model';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { BillingAccount, BillingAccountStatus } from 'types/Billing';
import { ChipType } from 'types/GlobalType';

@Component({
  selector: 'app-account-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatAccountStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatAccountStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class AccountStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: BillingAccount;
}

@Pipe({ name: 'appFormatAccountStatus' })
export class AppFormatAccountStatusPipe implements PipeTransform {
  public transform(accountStatus: BillingAccountStatus, type: string): string {
    if (type === 'class') {
      return this.buildAccountStatusClasses(accountStatus);
    }
    if (type === 'text') {
      return this.buildAccountStatusText(accountStatus);
    }
    return '';
  }

  public buildAccountStatusClasses(status: BillingAccountStatus): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case BillingAccountStatus.IDLE:
        classNames += ChipType.DANGER;
        break;
      case BillingAccountStatus.PENDING:
        classNames += ChipType.WARNING;
        break;
      case BillingAccountStatus.ACTIVE:
        classNames += ChipType.SUCCESS;
        break;
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildAccountStatusText(status: string): string {
    for (const accountStatus of ACCOUNT_STATUS) {
      if (accountStatus.key === status) {
        return accountStatus.value;
      }
    }
    return '';
  }
}
