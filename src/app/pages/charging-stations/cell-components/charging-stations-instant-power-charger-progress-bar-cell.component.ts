import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Charger, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="row.maximumPower === 0">
        {{row.connectors | appChargingStationsFormatPowerCharger:'instantPowerKW':row | number}}
        &nbsp;/&nbsp;
        {{row.connectors | appChargingStationsFormatPowerCharger:'maxPowerKW':row | number}} kW
      </div>
      <mat-progress-bar color="accent" class="d-flex" [hidden]="row.maximumPower === 0"
        [value]="row.connectors | appChargingStationsFormatPowerCharger:'instantPowerKWPercent':row" mode="determinate">
      </mat-progress-bar>
    </div>
  `
})
export class ChargingStationsInstantPowerChargerProgressBarCellComponent extends CellContentTemplateComponent {
  @Input() row: Charger;
}

@Pipe({name: 'appChargingStationsFormatPowerCharger'})
export class AppChargingStationsFormatPowerChargerPipe implements PipeTransform {
  transform(connectors: Connector[], type: string, charger: Charger): number {
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
            return 0;
          }
          return Math.round((instantPowerKW * 1000 / charger.maximumPower) * 100);
        } else {
          return instantPowerKW;
        }

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
            // Charging in parallel?
            if (charger.cannotChargeInParallel) {
              // No: Take only one connector
              if (maxPowerKW === 0) {
                maxPowerKW += connector.power;
              }
            } else {
              // Yes: Add up connector power
              maxPowerKW += connector.power;
            }
          }
        }
        // Watt -> kWatts
        maxPowerKW /= 1000;
        return Math.round((maxPowerKW * 10)) / 10;
    }
  }
}
