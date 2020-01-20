import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStation, ChargingStationCurrentType, Connector } from 'app/types/ChargingStation';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit {
  private static MIN_AMP = 6;

  @Input() charger!: ChargingStation;
  @Input() connector!: Connector;
  @Input() currentAmp!: number;
  @Input() forChargingProfile = false;
  @Output() powerSliderChanged = new EventEmitter<number>();

  public minAmp = ChargingStationPowerSliderComponent.MIN_AMP;
  public maxAmp = ChargingStationPowerSliderComponent.MIN_AMP;
  public displayedMinPowerKW = '';
  public displayedMaxPowerKW = '';
  public displayedCurrentPowerW = '';
  public notSupported = false;

  constructor(
    private appUnitFormatter: AppUnitPipe,
    private decimalPipe: AppDecimalPipe) {
  }

  ngOnInit() {
    // Check
    if (!this.charger ||
        !this.charger.connectors ||
        Utils.isEmptyArray(this.charger.connectors) ||
        this.charger.currentType !== ChargingStationCurrentType.AC) {
      this.notSupported = true;
      return;
    }
    // Connector Provided?
    if (this.connector) {
      // Charging Profile?
      if (this.forChargingProfile) {
        this.maxAmp = this.connector.amperageLimit;
      } else {
        this.maxAmp = this.connector.amperage;
        this.currentAmp = this.connector.amperageLimit;
      }
    } else {
      this.maxAmp = 0;
      if (!this.forChargingProfile) {
        this.currentAmp = 0;
      }
      // Add all connector's amps
      for (const connector of this.charger.connectors) {
        // Charging Profile?
        if (this.forChargingProfile) {
          this.maxAmp += connector.amperageLimit;
        } else {
          this.maxAmp += connector.amperage;
          this.currentAmp += connector.amperageLimit;
        }
      }
    }
    // Default
    if (!this.currentAmp) {
      this.currentAmp = this.maxAmp;
    }
    // Convert
    this.updateDisplayedPowerKW();
    // Check
    if (!this.maxAmp) {
      this.notSupported = true;
    }
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string|null => {
    const powerKW = Math.floor(parseInt(this.convertAmpToPower(currentAmp, 'W', false), 10));
    return this.decimalPipe.transform(powerKW);
  }

  public sliderChanged(value: number) {
    if (value) {
      this.currentAmp = value;
      // Update Power
      this.displayedCurrentPowerW = this.convertAmpToPower(value, 'W');
      // Notify
      this.powerSliderChanged.emit(value);
    }
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = this.convertAmpToPower(this.minAmp);
    this.displayedMaxPowerKW = this.convertAmpToPower(this.maxAmp);
    this.displayedCurrentPowerW = this.convertAmpToPower(this.currentAmp, 'W');
  }

  private convertAmpToPower(ampValue: number, unit: 'W'|'kW' = 'kW', displayUnit: boolean = true): string {
    if (this.charger.connectors[0].numberOfConnectedPhase) {
      return this.appUnitFormatter.transform(
        ChargingStations.convertAmpToW(this.charger.connectors[0].numberOfConnectedPhase, ampValue), 'W', unit, displayUnit, 1, 0);
    }
    return 'N/A';
  }
}
