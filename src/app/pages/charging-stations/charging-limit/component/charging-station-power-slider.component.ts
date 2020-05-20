import { Component, EventEmitter, Injectable, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ComponentService } from 'app/services/component.service';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStation, Connector, StaticLimitAmps } from 'app/types/ChargingStation';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
})
@Injectable()
export class ChargingStationPowerSliderComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public connector!: Connector;
  @Input() public currentAmp!: number;
  @Input() public forChargingProfile = false;
  @Output() public silderChanged = new EventEmitter<number>();

  public minAmp = StaticLimitAmps.MIN_LIMIT;
  public maxAmp = StaticLimitAmps.MIN_LIMIT;
  public displayedMinPowerKW = '';
  public displayedMaxPowerKW = '';
  public displayedCurrentPowerW = '';
  public notSupported = false;
  public isSmartChargingComponentActive = false;
  public ampSteps = StaticLimitAmps.MIN_LIMIT;

  constructor(
      private appUnitFormatter: AppUnitPipe,
      private componentService: ComponentService,
      private decimalPipe: AppDecimalPipe) {
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public ngOnChanges() {
    // Update Power
    this.displayedCurrentPowerW = Utils.convertAmpToPowerString(
      this.chargingStation, this.appUnitFormatter, this.currentAmp, 'W');
  }

  public ngOnInit() {
    // Get powers
    const chargerPowers = Utils.getChargingStationPowers(this.chargingStation, this.connector, this.forChargingProfile);
    if (!this.currentAmp) {
      this.currentAmp = chargerPowers.currentAmp;
    }
    this.minAmp = chargerPowers.minAmp;
    this.maxAmp = chargerPowers.maxAmp;
    this.notSupported = chargerPowers.notSupported;
    // Convert
    this.updateDisplayedPowerKW();
    this.ampSteps = Utils.computeAmpSteps(this.chargingStation);
    console.log('====================================');
    console.log(this.ampSteps);
    console.log('====================================');
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string|null => {
    const powerKW = Math.floor(Utils.convertAmpToPowerWatts(this.chargingStation, currentAmp) / 1000);
    return this.decimalPipe.transform(powerKW) + 'kW';
  }

  public sliderChanged(value: number) {
    this.currentAmp = value;
    // Update Power
    this.displayedCurrentPowerW = Utils.convertAmpToPowerString(this.chargingStation, this.appUnitFormatter, value, 'W');
    // Notify
    this.silderChanged.emit(value);
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = Utils.convertAmpToPowerString(this.chargingStation, this.appUnitFormatter, this.minAmp);
    this.displayedMaxPowerKW = Utils.convertAmpToPowerString(this.chargingStation, this.appUnitFormatter, this.maxAmp);
    this.displayedCurrentPowerW = Utils.convertAmpToPowerString(this.chargingStation, this.appUnitFormatter, this.currentAmp, 'W');
  }
}
