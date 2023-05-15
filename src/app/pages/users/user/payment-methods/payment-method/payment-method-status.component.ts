import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { BillingPaymentMethod } from '../../../../../types/Billing';
import { ChipType } from '../../../../../types/GlobalType';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row | appPaymentMethodStatus : 'class'" [disabled]="true">
        {{ row | appPaymentMethodStatus : 'text' | translate }}
      </mat-chip>
      <mat-chip-list> </mat-chip-list
    ></mat-chip-list>
  `,
})
export class PaymentMethodStatusComponent extends CellContentTemplateDirective {
  @Input() public row!: BillingPaymentMethod;
}

@Pipe({ name: 'appPaymentMethodStatus' })
export class AppPaymentMethodStatusPipe implements PipeTransform {
  public transform(paymentMethod: BillingPaymentMethod, type: string): string {
    if (type === 'class') {
      return this.buildStatusClasses(paymentMethod);
    }
    if (type === 'text') {
      return this.buildStatusText(paymentMethod);
    }
    return '';
  }

  public buildStatusClasses(paymentMethod: BillingPaymentMethod): string {
    let classNames = 'chip-width-8em ';
    if (this.isExpired(paymentMethod)) {
      classNames += ChipType.DANGER;
    } else if (this.expireSoon(paymentMethod)) {
      classNames += ChipType.WARNING;
    } else {
      classNames += ChipType.SUCCESS;
    }
    return classNames;
  }

  public buildStatusText(paymentMethod: BillingPaymentMethod): string {
    if (this.isExpired(paymentMethod)) {
      return 'settings.billing.payment_methods_expired';
    }
    if (this.expireSoon(paymentMethod)) {
      return 'settings.billing.payment_methods_expire_soon';
    }
    return 'settings.billing.payment_methods_valid';
  }

  private isExpired(paymentMethod: BillingPaymentMethod): boolean {
    return paymentMethod.expiringOn && moment().isAfter(moment(paymentMethod.expiringOn));
  }

  private expireSoon(paymentMethod: BillingPaymentMethod): boolean {
    return (
      paymentMethod.expiringOn &&
      moment(paymentMethod.expiringOn).isBefore(moment().add(2, 'months'))
    );
  }
}
