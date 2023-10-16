import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation } from '../../../types/ChargingStation';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <ng-container *ngFor="let connector of row.connectors">
        <app-charging-stations-connector-cell
          [row]="connector"
        ></app-charging-stations-connector-cell>
      </ng-container>
    </div>
  `,
})
export class ChargingStationsConnectorsCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
}
