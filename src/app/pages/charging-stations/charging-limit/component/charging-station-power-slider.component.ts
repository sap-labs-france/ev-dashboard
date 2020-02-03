import { Component, EventEmitter, Injectable, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStation, Connector } from 'app/types/ChargingStation';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit, OnChanges {
  private static MIN_AMP = 6;

  @Input() charger!: ChargingStation;
  @Input() connector!: Connector;
  @Input() currentAmp!: number;
  @Input() forChargingProfile = false;
  @Output() silderChanged = new EventEmitter<number>();

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

  ngOnChanges() {
    // Update Power
    this.displayedCurrentPowerW = Utils.convertAmpToPowerString(this.charger, this.appUnitFormatter, this.currentAmp, 'W');
  }

  ngOnInit() {
    // Get powers
    const chargerPowers = Utils.getChargingStationPowers(this.charger, this.connector, this.forChargingProfile);
    this.currentAmp = chargerPowers.currentAmp;
    this.minAmp = chargerPowers.minAmp;
    this.maxAmp = chargerPowers.maxAmp;
    this.notSupported = chargerPowers.notSupported;
    // Convert
    this.updateDisplayedPowerKW();
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string|null => {
    const powerKW = Math.floor(Utils.convertAmpToPowerWatts(this.charger, currentAmp) / 1000);
    return this.decimalPipe.transform(powerKW);
  }

  public sliderChanged(value: number) {
    if (value) {
      this.currentAmp = value;
      // Update Power
      this.displayedCurrentPowerW = Utils.convertAmpToPowerString(this.charger, this.appUnitFormatter, value, 'W');
      // Notify
      this.silderChanged.emit(value);
    }
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = Utils.convertAmpToPowerString(this.charger, this.appUnitFormatter, this.minAmp);
    this.displayedMaxPowerKW = Utils.convertAmpToPowerString(this.charger, this.appUnitFormatter, this.maxAmp);
    this.displayedCurrentPowerW = Utils.convertAmpToPowerString(this.charger, this.appUnitFormatter, this.currentAmp, 'W');
  }
}
