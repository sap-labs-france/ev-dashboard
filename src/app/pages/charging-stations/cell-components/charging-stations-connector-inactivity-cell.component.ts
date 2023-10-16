import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Connector } from '../../../types/ChargingStation';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ms-1" [ngClass]="row.currentInactivityStatus | appColorByStatus">
          {{ { currentTotalInactivitySecs: row.currentTotalInactivitySecs } | appInactivity }}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingStationsConnectorInactivityCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Connector;
}
