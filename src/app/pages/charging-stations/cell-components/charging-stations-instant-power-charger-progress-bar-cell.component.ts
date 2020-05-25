import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ChargingStation, Connector } from 'app/types/ChargingStation';

import { AppDecimalPipe } from '../../../shared/formatters/app-decimal-pipe';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="row.maximumPower === 0">
        {{row.connectors | appChargingStationsFormatPowerCharger:'instantPowerKW':row}}
        &nbsp;/&nbsp;
        {{row.connectors | appChargingStationsFormatPowerCharger:'maxPowerKW':row}} kW
      </div>
      <mat-progress-bar color="accent" class="d-flex" [hidden]="row.maximumPower === 0"
        [value]="row.connectors | appChargingStationsFormatPowerCharger:'instantPowerKWPercent':row" mode="determinate">
      </mat-progress-bar>
    </div>
  `,
})
export class ChargingStationsInstantPowerChargerProgressBarCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
}

// tslint:disable-next-line: max-classes-per-file
@Pipe({name: 'appChargingStationsFormatPowerCharger'})
export class AppChargingStationsFormatPowerChargerPipe implements PipeTransform {
  constructor(private decimalPipe: AppDecimalPipe) {
  }

  public transform(connectors: Connector[], type: string, charger: ChargingStation): string {
    let value = 0;
    // Check
    switch (type) {
      // Compute Instance Power
      case 'instantPowerKWPercent':
      case 'instantPowerKW':
        let instantPowerKW = 0;
        for (const connector of connectors) {
          instantPowerKW += connector.currentConsumption;
        }
        // Watt -> kWatts
        instantPowerKW /= 1000;
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
          value = Math.round((instantPowerKW * 1000 / charger.maximumPower) * 100);
        } else {
          value = instantPowerKW;
        }
        break;

      // Compute Max Power
      case 'maxPowerKW':
        let maxPowerKW = 0;
        // Max power already filled?
        if (charger.maximumPower > 0) {
          // Max power is already assigned on charger level so take it
          maxPowerKW = charger.maximumPower;
        // Not set: calculate it from connectors
        } else {
          for (const connector of connectors) {
            // Yes: Add up connector power
            maxPowerKW += connector.power;
          }
        }
        // Watt -> kWatts
        maxPowerKW /= 1000;
        value = Math.round((maxPowerKW * 10)) / 10;
        break;
    }
    const result = this.decimalPipe.transform(value);
    return result ? result : '';
  }
}
