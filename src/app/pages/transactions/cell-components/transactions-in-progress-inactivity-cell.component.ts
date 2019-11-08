import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <span>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'info'">
        <span class="ml-1 text-success">
          {{row.currentTotalInactivitySecs | appInactivity:row.currentTotalDurationSecs}}
        </span>
      </ng-container>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'warning'">
        <span class="ml-1 text-warning">
          {{row.currentTotalInactivitySecs | appInactivity:row.currentTotalDurationSecs}}
        </span>
      </ng-container>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'danger'">
        <span class="ml-1 text-danger">
          {{row.currentTotalInactivitySecs | appInactivity:row.currentTotalDurationSecs}}
        </span>
      </ng-container>
      <ng-container *ngIf="!row.currentInactivityStatusLevel || (row.currentInactivityStatusLevel !== 'info' && row.currentInactivityStatusLevel !== 'warning' && row.currentInactivityStatusLevel !== 'danger')">
        <span class="ml-1">
          {{row.currentTotalInactivitySecs | appInactivity:row.currentTotalDurationSecs}}
        </span>
      </ng-container>
    </span>
  `,
})
export class TransactionsInProgressInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Transaction;
}
