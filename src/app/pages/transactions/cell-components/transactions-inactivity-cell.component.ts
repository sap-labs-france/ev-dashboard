import { Component, Input } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
    <ng-container>
      <span [ngClass]="(row.stop ? row.stop.inactivityStatusLevel : row.currentInactivityStatusLevel) | appColorByLevel">
        {{(row.stop ? row.stop.totalInactivitySecs : row.currentTotalInactivitySecs) | appInactivity:(row.stop ? row.stop.totalDurationSecs : row.currentTotalDurationSecs)}}
      </span>
    </ng-container>
  </span>
`,
})
export class TransactionsInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row!: Transaction;
}
