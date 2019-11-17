import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
    <ng-container *ngIf="row.stop">
      <span [ngClass]="row.stop.inactivityStatusLevel | appColorByLevel">
        {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
      </span>
    </ng-container>
    <ng-container *ngIf="!row.stop">
      <span [ngClass]="row.currentInactivityStatusLevel | appColorByLevel">
        {{row.currentTotalInactivitySecs | appInactivity:row.currentTotalDurationSecs}}
      </span>
    </ng-container>
  </span>
`,
})
export class TransactionsInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row!: Transaction;
}
