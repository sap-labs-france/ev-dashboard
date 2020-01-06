import { Component, EventEmitter, Injectable, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { Charger } from 'app/common.types';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStations } from 'app/utils/ChargingStations';


@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit {
  @Input() charger!: Charger;
  @Input() currentAmpValue: number = 0;
  @Output() powerSliderChanged = new EventEmitter<number>();

  public minAmp: number = 0;
  public maxAmp: number = 0;
  public displayedMinPowerKW: string = "";
  public displayedMaxPowerKW: string = "";
  public displayedCurrentPowerW: string = "";

  constructor(
    private appUnitFormatter: AppUnitPipe) {
  }

  ngOnInit(): void {
    console.log(this.charger);
    // Init
    if (this.charger) {
      this.minAmp = 6;
      // Add all connector's amps
      for (const connector of this.charger.connectors) {
        this.maxAmp += connector.amperage ? connector.amperage : 0;
      }
      // Set the current value
      // TODO: Add maximumAmperage prop to Charger
      if (!this.currentAmpValue) {
        this.currentAmpValue = this.maxAmp;
      }
      // Convert
      this.updateDisplayedPowerKW();
    }
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string => {
    return this.convertAmpToPower(currentAmp, 'kW', false);
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
    return this.appUnitFormatter.transform(
      ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, ampValue), 'W', unit, displayUnit, 1, 0);
  }
}
