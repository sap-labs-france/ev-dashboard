import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';

import { ComponentService } from '../../../../services/component.service';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal.pipe';
import { AppUnitPipe } from '../../../../shared/formatters/app-unit.pipe';
import { ChargePoint, ChargingStation, Connector } from '../../../../types/ChargingStation';
import { TenantComponents } from '../../../../types/Tenant';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-power-slider',
  templateUrl: 'charging-station-power-slider.component.html',
  styleUrls: ['charging-station-power-slider.component.scss'],
})
// @Injectable()
export class ChargingStationPowerSliderComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargePoint!: ChargePoint;
  @Input() public connector!: Connector;
  @Input() public currentAmp!: number;
  @Input() public forChargingProfile = false;
  @Output() public sliderChangedEmitter = new EventEmitter<number>();

  public minAmp;
  public maxAmp;
  public displayedMinPowerKW = '';
  public displayedMinPowerAmp = '';
  public displayedMaxPowerKW = '';
  public displayedMaxPowerAmp = '';
  public displayedCurrentPowerW = '';
  public notSupported = false;
  public isSmartChargingComponentActive = false;
  public ampSteps;

  public constructor(
    private appUnitFormatter: AppUnitPipe,
    private componentService: ComponentService,
    private decimalPipe: AppDecimalPipe
  ) {
    this.isSmartChargingComponentActive = this.componentService.isActive(
      TenantComponents.SMART_CHARGING
    );
  }

  public ngOnChanges() {
    // Update Power
    this.displayedCurrentPowerW = Utils.convertAmpToWattString(
      this.chargingStation,
      null,
      0,
      this.appUnitFormatter,
      this.currentAmp,
      'W'
    );
  }

  public ngOnInit() {
    // Get powers
    const chargerPowers = Utils.getChargingStationPowers(
      this.chargingStation,
      this.chargePoint,
      this.connector ? this.connector.connectorId : 0,
      this.forChargingProfile
    );
    if (Utils.isUndefined(this.currentAmp)) {
      this.currentAmp = chargerPowers.currentAmp;
    }
    this.minAmp = chargerPowers.minAmp;
    this.maxAmp = chargerPowers.maxAmp;
    this.notSupported = chargerPowers.notSupported;
    // Override the min for charging profile
    if (this.forChargingProfile) {
      this.minAmp = 0;
    }
    // Override Min in Charging Profile
    // Convert
    this.updateDisplayedPowerKW();
    this.ampSteps = Utils.computeStaticLimitAmpSteps(this.chargingStation, this.chargePoint);
  }

  public formatSlideLabelPowerKW = (currentAmp: number): string | null => {
    const powerKW = Math.floor(
      Utils.convertAmpToWatt(this.chargingStation, null, 0, currentAmp) / 1000
    );
    return this.decimalPipe.transform(powerKW) + 'kW';
  };

  public sliderChanged(value: number) {
    this.currentAmp = value;
    // Update Power
    this.displayedCurrentPowerW = Utils.convertAmpToWattString(
      this.chargingStation,
      null,
      0,
      this.appUnitFormatter,
      value,
      'W'
    );
    this.sliderChangedEmitter.emit(value);
  }

  private updateDisplayedPowerKW() {
    this.displayedMinPowerKW = Utils.convertAmpToWattString(
      this.chargingStation,
      null,
      0,
      this.appUnitFormatter,
      this.minAmp
    );
    this.displayedMaxPowerKW = Utils.convertAmpToWattString(
      this.chargingStation,
      null,
      0,
      this.appUnitFormatter,
      this.maxAmp
    );
    this.displayedCurrentPowerW = Utils.convertAmpToWattString(
      this.chargingStation,
      null,
      0,
      this.appUnitFormatter,
      this.currentAmp,
      'W'
    );
  }
}
