import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod } from '@stripe/stripe-js';
import * as moment from 'moment';
import { BillingPaymentMethod } from 'types/Billing';

import { CellContentTemplateDirective } from '../../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../../../../types/GlobalType';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row | appPaymentMethodStatus:'class'" [disabled]="true">
          {{row | appPaymentMethodStatus:'text' | translate}}
      </mat-chip>
  `,
})
export class PaymentMethodStatusComponent extends CellContentTemplateDirective {
  @Input() public row!: PaymentMethod;
}

@Pipe({name: 'appPaymentMethodStatus'})
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
      classNames += ChipType.WARNING
    } else {
      classNames += ChipType.SUCCESS;
    }
    return classNames;
  }

  public buildStatusText(paymentMethod: BillingPaymentMethod): string {
    if (this.isExpired(paymentMethod)) {
      return 'settings.billing.payment_methods.expired';
    }
    if (this.expireSoon(paymentMethod)) {
      return 'settings.billing.payment_methods.expire_soon';
    }
    return 'settings.billing.payment_methods.valid';
  }

  private isExpired(paymentMethod: BillingPaymentMethod): boolean {
    return paymentMethod.expiringOn && moment().isAfter(moment(paymentMethod.expiringOn, "MM/YYYY"));
  }

  private expireSoon(paymentMethod: BillingPaymentMethod): boolean {
    return paymentMethod.expiringOn && (moment(paymentMethod.expiringOn, "MM/YYYY").isBefore(moment().add(2, 'months')));
  }
}
