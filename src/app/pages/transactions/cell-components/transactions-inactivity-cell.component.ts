import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Transaction } from '../../../types/Transaction';

@Component({
  template: `
    <span>
      <ng-container>
        <span
          [ngClass]="
            (row.stop ? row.stop.inactivityStatus : row.currentInactivityStatus) | appColorByStatus
          "
        >
          {{ row | appInactivity }}
        </span>
      </ng-container>
    </span>
  `,
})
export class TransactionsInactivityCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Transaction;
}
