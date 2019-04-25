import {Component, Input, Pipe, PipeTransform} from '@angular/core';
import {Charger, Connector} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="d-flex flex-column align-items-center mx-2">
      <div class="d-flex power-bar-text" [class.power-bar-text-error]="maxPowerKW === 0">
        {{row.connectors | appFormatChargerPower:'instantPowerKW':row | number}} / {{row.connectors | appFormatChargerPower:'maxPowerKW':row | number}} kW
      </div>
      <mat-progress-bar color="accent" class="d-flex" [hidden]="maxPowerKW === 0"
        value="{{instantPowerKW / maxPowerKW * 100}}" mode="determinate">
      </mat-progress-bar>
    </div>
  `
})
export class InstantPowerProgressBarComponent extends CellContentTemplateComponent {
  @Input() row: any;
}

@Pipe({name: 'appFormatChargerPower'})
export class AppFormatChargerPower implements PipeTransform {
  transform(connectors: Connector[], type: string, charger: Charger): number {
    // Check
    switch (type) {
      // Compute Instance Power
      case 'instantPowerKW':
        let instantPowerKW = 0;
        for (const connector of connectors) {
          instantPowerKW += connector.currentConsumption;
        }
        // Watt -> kWatts
        instantPowerKW /= 1000;
        // Handle decimals
        if (instantPowerKW < 10) {
          instantPowerKW = parseFloat((instantPowerKW).toFixed(1))
        } else {
          instantPowerKW = parseFloat((instantPowerKW).toFixed(0))
        }
        return instantPowerKW;

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
        return Math.round(maxPowerKW);
    }
  }
}
