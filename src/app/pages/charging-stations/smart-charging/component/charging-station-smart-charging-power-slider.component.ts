import { AfterViewInit, Component, EventEmitter, Injectable, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'app/services/locale.service';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Constants } from 'app/utils/Constants';
import { ChargingStationSmartChargingUtils } from '../utils/charging-station-smart-charging-utils';

const MIN_POWER = 4000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing teh step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;

@Component({
  selector: 'app-charging-station-smart-charging-power-slider',
  templateUrl: 'charging-station-smart-charging-power-slider.component.html',
})
@Injectable()
export class ChargingStationSmartChargingPowerSliderComponent implements OnInit, AfterViewInit {
  @Input() maximumPower: number;
  @Input() powerUnit: string;
  @Input() numberOfConnectedPhase: number;
  @Input() textClass?: string;
  @Input() textPosition?: string;
  @Input() startValue?: any;
  @Input() displayMinSliderValue?: boolean;
  @Input() displayMaxSliderValue?: boolean;

  @Output() onSliderChange = new EventEmitter<number>();
  public maxPowerSlider: number;
  public minPowerSlider: number;
  public minPowerSliderDisplayed: number;
  public stepPowerSlider: number;
  public powerSliderValue = 0;
  public powerSliderDisplayedValueInkW = 0;
  public powerSliderPercent = 0;
  public currentDisplayedLimit: number;
  public isNotValid = true;

  public powerDigitPrecision = 1;
  public powerFloatingPrecision = 0;

  @ViewChild('powerSlider', { static: true }) powerSliderComponent: MatSlider;

  constructor(
    private translateService: TranslateService,
    private localeService: LocaleService,
    private appUnitFormatter: AppUnitPipe) {
  }

  ngOnInit(): void {
    // Initialize slider values
    if (this.powerUnit === Constants.OCPP_UNIT_WATT) {
      // Value of slider will be expressed in WATT
      this.minPowerSlider = MIN_POWER;
      this.minPowerSliderDisplayed = this.minPowerSlider;
      this.maxPowerSlider = this.maximumPower;
      this.stepPowerSlider = (this.maxPowerSlider > LIMIT_FOR_STEP_CHANGE ? LARGE_SLIDER_STEP : SMALL_SLIDER_STEP);
    } else if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
      // Value of slider will be expressed in Amper
      this.maxPowerSlider = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, this.maximumPower);
      this.minPowerSlider = 1;
      // Search minimum amper value to be just above MIN_POWER
      for (let index = 1; index < this.maxPowerSlider; index++) {
        if (Math.round(ChargingStations.convertAmpToW(this.numberOfConnectedPhase, index)) >= MIN_POWER) {
          this.minPowerSlider = index;
          break;
        }
      }
      this.minPowerSliderDisplayed = ChargingStations.convertAmpToW(this.numberOfConnectedPhase, this.minPowerSlider);
    }
    // For small charger increase display precision
    if (this.maximumPower < 10000) {
      this.powerDigitPrecision = 1;
      this.powerFloatingPrecision = 2;
    }
    if (this.startValue) {
      if (this.startValue.unit === this.powerUnit) {
        this.powerSliderValue = this.startValue.value;
      } else {
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER && this.startValue.unit === Constants.OCPP_UNIT_WATT) {
          this.powerSliderValue = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, this.startValue.value);
        }
        if (this.powerUnit === Constants.OCPP_UNIT_WATT && this.startValue.unit === Constants.OCPP_UNIT_AMPER) {
          this.powerSliderValue = ChargingStations.convertAmpToW(this.numberOfConnectedPhase, this.startValue.value);
        }
      }
      this.powerSliderDisplayedValueInkW = ChargingStationSmartChargingUtils.getDisplayedFormatValue(this.powerSliderValue, this.powerUnit,
        'kW',
        this.powerDigitPrecision,
        this.powerFloatingPrecision,
        this.numberOfConnectedPhase,
        this.appUnitFormatter,
        true);
    }
    // Default display
    if (this.displayMaxSliderValue === undefined) {
      this.displayMaxSliderValue = true;
    }
    if (this.displayMinSliderValue === undefined) {
      this.displayMinSliderValue = true;
    }
    if (this.textPosition === undefined) {
      this.textPosition = 'bottom';
    }
  }

  ngAfterViewInit(): void {
  }

  public formatPowerPercent(value: number | null) {
    const self = this as unknown as MatSlider; // To check why we have issue between compile and runtime. At runtime this is a MatSlider
    if (!value) {
      return '0';
    }
    return `${Math.round(value / self.max * 100)}%`;
  }

  public sliderChanged() {
    this.powerSliderDisplayedValueInkW = ChargingStationSmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value,
      this.powerUnit,
      'kW',
      this.powerDigitPrecision,
      this.powerFloatingPrecision,
      this.numberOfConnectedPhase,
      this.appUnitFormatter,
      true);
    this.isNotValid = this.powerSliderDisplayedValueInkW < 3;
    this.powerSliderValue = this.powerSliderComponent.value;
    this.onSliderChange.emit(this.powerSliderValue);
  }

  public sliderInput() {
    this.powerSliderDisplayedValueInkW = ChargingStationSmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value,
      this.powerUnit,
      'kW',
      this.powerDigitPrecision,
      this.powerFloatingPrecision,
      this.numberOfConnectedPhase,
      this.appUnitFormatter,
      true);
    this.isNotValid = this.powerSliderDisplayedValueInkW < 3;
    //    this.onSliderChange.emit(this.powerSliderValue);
  }

  public setSliderValue(value, valueUnit) {
    switch (valueUnit) {
      case 'W':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
          this.powerSliderValue = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, value);
        } else {
          this.powerSliderValue = value;
        }
        this.powerSliderDisplayedValueInkW = ChargingStationSmartChargingUtils.getDisplayedFormatValue(value,
          'W',
          'kW',
          this.powerDigitPrecision,
          this.powerFloatingPrecision,
          this.numberOfConnectedPhase,
          this.appUnitFormatter,
          true);
        break;
      case 'kW':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
          this.powerSliderValue = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, value * 1000);
        } else {
          this.powerSliderValue = value * 1000;
        }
        this.powerSliderDisplayedValueInkW = value;
        break;
      case 'A':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
          this.powerSliderValue = value;
        } else {
          this.powerSliderValue = ChargingStations.convertAmpToW(this.numberOfConnectedPhase, value);
        }
        this.powerSliderDisplayedValueInkW = ChargingStationSmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value,
          'A',
          'kW',
          this.powerDigitPrecision,
          this.powerFloatingPrecision,
          this.numberOfConnectedPhase,
          this.appUnitFormatter,
          true);
        break;
      default:
        break;
    }
  }

  public getDisplayedValue(unit) {
    if (unit === 'W') {
      return this.powerSliderValue;
    }
    if (unit === 'kW') {
      return this.powerSliderDisplayedValueInkW;
    }

  }
}
