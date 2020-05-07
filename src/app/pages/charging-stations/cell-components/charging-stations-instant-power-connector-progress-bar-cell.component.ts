import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Connector } from 'app/types/ChargingStation';
import { AppDecimalPipe } from '../../../shared/formatters/app-decimal-pipe';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="row.power === 0">
        {{row | appChargingStationsFormatPowerConnector:'instantPowerKW'}}
        &nbsp;/&nbsp;
        {{row | appChargingStationsFormatPowerConnector:'maxPowerKW'}} kW
      </div>
      <mat-progress-bar color="accent" class="d-flex" [hidden]="row.power === 0"
        [value]="row | appChargingStationsFormatPowerConnector:'instantPowerKWPercent'" mode="determinate">
      </mat-progress-bar>
    </div>
  `,
})
export class ChargingStationsInstantPowerConnectorProgressBarCellComponent extends CellContentTemplateComponent {
  @Input() public row!: Connector;
}

@Pipe({name: 'appChargingStationsFormatPowerConnector'})
export class AppChargingStationsFormatPowerConnectorPipe implements PipeTransform {
  constructor(private decimalPipe: AppDecimalPipe) {
  }

  public transform(connector: Connector, type: string): string {
    let value = 0;
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
            value = 0;
          }
          value = Math.round((instantPowerKW * 1000 / connector.power) * 100);
        } else {
          value = instantPowerKW;
        }
        break;

      // Compute Max Power
      case 'maxPowerKW':
        if (connector.power) {
          value = Math.round(connector.power / 100) / 10;
        } else {
          value = 0;
        }
        break;
    }
    const result = this.decimalPipe.transform(value);
    return result ? result : '';
  }
}
