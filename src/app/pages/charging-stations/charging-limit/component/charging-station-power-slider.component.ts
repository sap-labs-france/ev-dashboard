import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { TableColumnDef, TableDef } from 'app/types/Table';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStation, Connector } from 'app/types/ChargingStation';
import { ChargingStations } from 'app/utils/ChargingStations';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit {
  @Input() charger!: ChargingStation;
  @Input() connector!: Connector;
  @Input() currentAmpValue = 0;
  @Input() columnDef!: TableColumnDef;
  @Input() row!: any;
  @Output() powerSliderChanged = new EventEmitter<number>();

  public minAmp = 0;
  public maxAmp = 0;
  public displayedMinPowerKW = '';
  public displayedMaxPowerKW = '';
  public displayedCurrentPowerW = '';

  constructor(
    private appUnitFormatter: AppUnitPipe) {
  }

  ngOnInit(): void {
    if(!this.charger){
      this.charger = this.columnDef.additionalParameters;
    }
    // Init
    if (this.charger) {
      this.minAmp = 6;
      // Add all connector's amps
      for (const connector of this.charger.connectors) {
        this.maxAmp += connector.amperage ? connector.amperage : 0;
      }
      // Set the current value
      // TODO: Add maximumAmperage prop to Charger to store the applied or should it be calculated?
      if (!this.currentAmpValue) {
        this.currentAmpValue = this.maxAmp;
      }
      if (this.row) {
        this.currentAmpValue = this.row.limit;
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
      this.row.limit = value
      this.row.displayedLimitInkW = this.convertAmpToPower(value, 'W');;
      console.log(value);
    }
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = this.convertAmpToPower(this.minAmp);
    this.displayedMaxPowerKW = this.convertAmpToPower(this.maxAmp);
    this.displayedCurrentPowerW = this.convertAmpToPower(this.currentAmpValue, 'W');
  }

  private convertAmpToPower(ampValue: number, unit: 'W'|'kW' = 'kW', displayUnit: boolean = true): string {
    // if (this.connector.numberOfConnectedPhase) {
    //   return this.appUnitFormatter.transform(
    //     ChargingStations.convertAmpToW(this.connector.numberOfConnectedPhase, ampValue), 'W', unit, displayUnit, 1, 0);
    // }
    if (this.charger.numberOfConnectedPhase){
      return this.appUnitFormatter.transform(
        ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, ampValue), 'W', unit, displayUnit, 1, 0);}
    else{
    return 'N/A';

      }
  }
}
