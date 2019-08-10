import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="row.power === 0">
        {{row | appChargingStationsFormatPowerConnector:'instantPowerKW':row | number}}
        &nbsp;/&nbsp;
        {{row | appChargingStationsFormatPowerConnector:'maxPowerKW':row | number}} kW
      </div>
      <mat-progress-bar color="accent" class="d-flex" [hidden]="row.power === 0"
        [value]="row | appChargingStationsFormatPowerConnector:'instantPowerKWPercent':row" mode="determinate">
      </mat-progress-bar>
    </div>
  `
})
export class ChargingStationsInstantPowerConnectorProgressBarCellComponent extends CellContentTemplateComponent {
  @Input() row: Connector;
}

@Pipe({name: 'appChargingStationsFormatPowerConnector'})
export class AppChargingStationsFormatPowerConnectorPipe implements PipeTransform {
  transform(connector: Connector, type: string): number {
    // Check
    switch (type) {
      // Compute Instance Power
      case 'instantPowerKWPercent':
      case 'instantPowerKW':
        // Watt -> kWatts
        let instantPowerKW = connector.currentConsumption / 1000;
        // Handle decimals
        if (instantPowerKW < 10) {
          instantPowerKW = parseFloat((instantPowerKW).toFixed(1));
        } else {
          instantPowerKW = parseFloat((instantPowerKW).toFixed(0));
        }
        if (type === 'instantPowerKWPercent') {
          if (instantPowerKW === 0) {
            return 0;
          }
          return Math.round((instantPowerKW * 1000 / connector.power) * 100);
        } else {
          return instantPowerKW;
        }

      // Compute Max Power
      case 'maxPowerKW':
        if (connector.power) {
          return Math.round(connector.power / 1000);
        } else {
          return 0;
        }
    }
  }
}
