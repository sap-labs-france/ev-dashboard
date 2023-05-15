import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { AppDecimalPipe } from '../../../shared/formatters/app-decimal.pipe';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation, Connector } from '../../../types/ChargingStation';
import { Utils } from '../../../utils/Utils';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="row.maximumPower === 0">
        {{ row.connectors | appChargingStationsFormatPowerCharger : 'instantPowerKW' : row }}
        &nbsp;/&nbsp;
        {{ row.connectors | appChargingStationsFormatPowerCharger : 'maxPowerKW' : row }} kW
      </div>
      <mat-progress-bar
        color="accent"
        class="d-flex"
        [hidden]="row.maximumPower === 0"
        [value]="
          row.connectors | appChargingStationsFormatPowerCharger : 'instantPowerKWPercent' : row
        "
        mode="determinate"
      >
      </mat-progress-bar>
    </div>
  `,
  styleUrls: ['charging-stations-common.component.scss'],
})
export class ChargingStationsInstantPowerChargerProgressBarCellComponent extends CellContentTemplateDirective {
  @Input() public row!: ChargingStation;
}

@Pipe({ name: 'appChargingStationsFormatPowerCharger' })
export class AppChargingStationsFormatPowerChargerPipe implements PipeTransform {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private decimalPipe: AppDecimalPipe) {}

  public transform(
    connectors: Connector[],
    type: string,
    chargingStation: ChargingStation
  ): string {
    let value = 0;
    switch (type) {
      // Compute Instance Power
      case 'instantPowerKWPercent':
      case 'instantPowerKW':
        let instantPowerKW = 0;
        for (const connector of connectors) {
          instantPowerKW += connector.currentInstantWatts;
        }
        // Watt -> kWatts
        instantPowerKW /= 1000;
        // Handle decimals
        if (instantPowerKW < 10) {
          instantPowerKW = Utils.roundTo(instantPowerKW, 1);
        } else {
          instantPowerKW = Utils.roundTo(instantPowerKW, 0);
        }
        if (type === 'instantPowerKWPercent') {
          if (instantPowerKW === 0) {
            value = 0;
          }
          value = Math.round(((instantPowerKW * 1000) / chargingStation.maximumPower) * 100);
        } else {
          value = instantPowerKW;
        }
        break;

      // Compute Max Power
      case 'maxPowerKW':
        let maxPowerKW = 0;
        // Max power already filled?
        if (chargingStation.maximumPower > 0) {
          // Max power is already assigned on charging station level so take it
          maxPowerKW = chargingStation.maximumPower;
          // Not set: calculate it from connectors
        } else {
          if (chargingStation.chargePoints) {
            // Add charge point power
            for (const chargePoint of chargingStation.chargePoints) {
              maxPowerKW += Utils.getChargingStationPower(chargingStation, chargePoint);
            }
          } else {
            // Add connector power
            for (const connector of connectors) {
              maxPowerKW += connector.power;
            }
          }
        }
        // Watt -> kWatts
        maxPowerKW /= 1000;
        value = Utils.roundTo(maxPowerKW, 1);
        break;
    }
    const result = this.decimalPipe.transform(value);
    return result ? result : '';
  }
}
