import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'info'">
    <span class="ml-1 text-success">
      {{row.totalInactivitySecs | appInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'warning'">
    <span class="ml-1 text-warning">
      {{row.totalInactivitySecs | appInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'danger'">
    <span class="ml-1 text-danger">
      {{row.totalInactivitySecs | appInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="!row.inactivityStatusLevel || (row.inactivityStatusLevel !== 'info' && row.inactivityStatusLevel !== 'warning' && row.inactivityStatusLevel !== 'danger')">
    <span class="ml-1">
      {{row.totalInactivitySecs | appInactivity}}
    </span>
  </ng-container>
</span>
`,
})
export class ChargingStationsConnectorInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Connector;
}
