import { Component, Input } from '@angular/core';
import { Connector } from 'app/types/ChargingStation';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ml-1" [ngClass]="row.inactivityStatus | appColorByStatus">
          {{row.totalInactivitySecs | appInactivity}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingStationsConnectorInactivityCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Connector;
}
