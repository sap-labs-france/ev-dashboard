import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStation, Connector } from 'app/types/ChargingStation';
import { ChargingStations } from 'app/utils/ChargingStations';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit {
  @Input() charger!: ChargingStation;
  @Input() connector!: Connector;
  @Input() currentAmpValue = 0;
  @Output() powerSliderChanged = new EventEmitter<number>();

  public minAmp = 0;
  public maxAmp = 0;
  public displayedMinPowerKW = '';
  public displayedMaxPowerKW = '';
  public displayedCurrentPowerW = '';
  public notSupported = false;

  constructor(
    private appUnitFormatter: AppUnitPipe,
    private decimalPipe: AppDecimalPipe) {
  }

  ngOnInit(): void {
    // Init
    if (this.charger) {
      this.minAmp = 6;
      this.maxAmp = 6;
      this.currentAmpValue = 6;
      // Add all connector's amps
      for (const connector of this.charger.connectors) {
        this.maxAmp += connector.amperage ? connector.amperage : 0;
        this.currentAmpValue += connector.amperageLimit;
      }
      // Convert
      this.updateDisplayedPowerKW();
      if (this.minAmp === this.maxAmp) {
        this.notSupported = true;
      }
    }
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string|null => {
    const powerKW = Math.floor(parseInt(this.convertAmpToPower(currentAmp, 'W', false), 10));
    return this.decimalPipe.transform(powerKW);
  }

  public sliderChanged(value: number) {
    if (value) {
      // Update Power
      this.displayedCurrentPowerW = this.convertAmpToPower(value, 'W');
      // Notify
      this.powerSliderChanged.emit(value);
    }
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = this.convertAmpToPower(this.minAmp);
    this.displayedMaxPowerKW = this.convertAmpToPower(this.maxAmp);
    this.displayedCurrentPowerW = this.convertAmpToPower(this.currentAmpValue, 'W');
  }

  private convertAmpToPower(ampValue: number, unit: 'W'|'kW' = 'kW', displayUnit: boolean = true): string {
    if (this.connector.numberOfConnectedPhase) {
      return this.appUnitFormatter.transform(
        ChargingStations.convertAmpToW(this.connector.numberOfConnectedPhase, ampValue), 'W', unit, displayUnit, 1, 0);
    }
    return 'N/A';
  }
}
