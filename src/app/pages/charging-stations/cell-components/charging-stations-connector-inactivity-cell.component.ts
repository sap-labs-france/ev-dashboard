import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
    <ng-container *ngIf="row.inactivityStatusLevel">
      <span [ngClass]="row.inactivityStatusLevel | appColorByLevel">
        {{row.totalInactivitySecs | appInactivity}}
      </span>
    </ng-container>
    <ng-container *ngIf="!row.inactivityStatusLevel">
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
