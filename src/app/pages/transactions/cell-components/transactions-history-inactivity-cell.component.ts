import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'info'">
    <span class="ml-1 text-success">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'warning'">
    <span class="ml-1 text-warning">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'danger'">
    <span class="ml-1 text-danger">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="!row.stop.inactivityStatusLevel || (row.stop.inactivityStatusLevel !== 'info' && row.stop.inactivityStatusLevel !== 'warning' && row.stop.inactivityStatusLevel !== 'danger')">
    <span class="ml-1">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
</span>
`,
})
export class TransactionsHistoryInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Transaction;
}
