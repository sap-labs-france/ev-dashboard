import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { SUBACCOUNT_STATUS as ACCOUNT_STATUS } from 'shared/model/subaccount-status.model';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { BillingAccount, BillingAccountStatus } from 'types/Billing';
import { ChipType } from 'types/GlobalType';

@Component({
  selector: 'app-subaccount-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatSubAccountStatus:'class'" [disabled]="true">
        {{row.status | appFormatSubAccountStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class SubAccountStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: BillingAccount;
}

@Pipe({ name: 'appFormatSubAccountStatus' })
export class AppFormatSubAccountStatusPipe implements PipeTransform {
  public transform(accountStatus: BillingAccountStatus, type: string): string {
    if (type === 'class') {
      return this.buildSubAccountStatusClasses(accountStatus);
    }
    if (type === 'text') {
      return this.buildSubAccountStatusText(accountStatus);
    }
    return '';
  }

  public buildSubAccountStatusClasses(status: BillingAccountStatus): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case BillingAccountStatus.IDLE:
        classNames += ChipType.DANGER;
        break;
      case BillingAccountStatus.PENDING:
        classNames += ChipType.WARNING;
        break;
      case BillingAccountStatus.ACTIVE:
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildSubAccountStatusText(status: string): string {
    for (const accountStatus of ACCOUNT_STATUS) {
      if (accountStatus.key === status) {
        return accountStatus.value;
      }
    }
    return '';
  }
}
