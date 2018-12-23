import {Component, Input, OnInit, Injectable, ViewChildren, QueryList, EventEmitter, ViewChild, Output, AfterViewInit} from '@angular/core';
import {Charger} from '../../../../common.types';
import {LocaleService} from '../../../../services/locale.service';
import {TranslateService} from '@ngx-translate/core';
import {ChargingStations} from '../../../../utils/ChargingStations';
import {Constants} from '../../../../utils/Constants';
import {MatSlider} from '@angular/material/slider';
import {AppUnitPipe} from '../../../../shared/formatters/app-unit.pipe'
import {SmartChargingUtils} from './smart-charging-utils';

const MIN_POWER = 3000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing teh step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;

@Component({
  selector: 'app-smart-charging-power-slider',
  template: `
              <div *ngIf="(textPosition==='top')" class="row col-md-12 text-center">
                <div [class]="(textClass ? textClass : '')">{{powerSliderValue}}/{{maximumPower | appUnit:'W':'kW':true:powerDigitPrecision:powerFloatingPrecision}}</div>
              </div>
            <div class="row col-md-12">
              <div *ngIf="(textPosition==='left')" [class]="'col-md-4 ' + (textClass ? textClass : '')">{{powerSliderValue}}/{{maximumPower | appUnit:'W':'kW':true:powerDigitPrecision:powerFloatingPrecision}}</div>
              <mat-slider #powerSlider thumbLabel [displayWith]="formatPowerPercent" [ngClass]="((textPosition==='left' || textPosition==='right') ? 'col-md-8' : 'col-md-12')"  
                    (input)="sliderInput()" (change)="sliderChanged()" 
                    [min]="minPowerSlider" [max]="maxPowerSlider" [step]="stepPowerSlider">
              </mat-slider>
              <div *ngIf="(textPosition==='right')" [class]="'col-md-4 ' + (textClass ? textClass : '')">{{powerSliderValue}}/{{maximumPower | appUnit:'W':'kW':true:powerDigitPrecision:powerFloatingPrecision}}</div>
              </div>
              <div *ngIf="(!textPosition || textPosition==='bottom')" class="row ">
                <div [class]="(textClass ? textClass : '') +  ' col-md-12 text-center'">{{powerSliderValue}}/{{maximumPower | appUnit:'W':'kW':true:powerDigitPrecision:powerFloatingPrecision}}</div>
              </div>
            `
})
@Injectable()
export class SmartChargingPowerSliderComponent implements OnInit, AfterViewInit {
  @Input() maximumPower: number;
  @Input() powerUnit: string;
  @Input() numberOfConnectedPhase: number;
  @Input() textClass?: string;
  @Input() textPosition?: number;
  @Input() startValue?: any;

  @Output() onSliderChange = new EventEmitter<number>();
  public maxPowerSlider: number;
  public minPowerSlider: number;
  public stepPowerSlider: number;
  public powerSliderValue: number = 0;
  public powerSliderPercent: number = 0;
  public currentDisplayedLimit: number;
  public isNotValid: boolean = true;

  private powerDigitPrecision = 2;
  private powerFloatingPrecision = 0;

  @ViewChild('powerSlider') powerSliderComponent: MatSlider;

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
      this.maxPowerSlider = this.maximumPower;
      this.stepPowerSlider = (this.maxPowerSlider > LIMIT_FOR_STEP_CHANGE ? LARGE_SLIDER_STEP : SMALL_SLIDER_STEP);
    } else if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
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
    }
    // For small charger increase display precision
    if (this.maximumPower < 10000) {
      this.powerDigitPrecision = 1;
      this.powerFloatingPrecision = 2;
    }
  }

  ngAfterViewInit(): void {
    if (this.startValue) {
      this.setSliderValue(this.startValue.value, this.startValue.unit);
    }    
  }

  public formatPowerPercent(value: number | null) {
    const self = <MatSlider><unknown>this; // To check why we have issue between compile and runtime. At runtime this is a MatSlider
    if (!value) {
      return "0";
    }
    return `${Math.round(value/self.max*100)}`;
  }

  public sliderChanged() {
    this.powerSliderValue = SmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value, this.powerUnit, 'kW', this.powerDigitPrecision, this.powerFloatingPrecision, this.numberOfConnectedPhase, this.appUnitFormatter);
    this.isNotValid = this.powerSliderValue < 3;
    this.onSliderChange.emit(this.powerSliderComponent.value);
  }

  public sliderInput() {
    this.powerSliderValue = SmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value, this.powerUnit, 'kW', this.powerDigitPrecision, this.powerFloatingPrecision, this.numberOfConnectedPhase, this.appUnitFormatter);
    this.isNotValid = this.powerSliderValue < 3;
    this.onSliderChange.emit(this.powerSliderComponent.value);
  }

  public setSliderValue(value, valueUnit) {
    switch (valueUnit) {
      case 'W':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
          this.powerSliderComponent.value = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, value);
        } else {
          this.powerSliderComponent.value = value;
        }
        this.powerSliderValue = SmartChargingUtils.getDisplayedFormatValue(value, 'W', 'kW', this.powerDigitPrecision, this.powerFloatingPrecision, this.numberOfConnectedPhase, this.appUnitFormatter);
        break;
      case 'kW':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
          this.powerSliderComponent.value = ChargingStations.convertWToAmp(this.numberOfConnectedPhase, value * 1000);
        } else {
          this.powerSliderComponent.value = value * 1000;
        }
        this.powerSliderValue = value;
        break;
      case 'A':
        if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
          this.powerSliderComponent.value = value;
        } else {
          this.powerSliderComponent.value = ChargingStations.convertAmpToW(this.numberOfConnectedPhase, value);
        }
        this.powerSliderValue = SmartChargingUtils.getDisplayedFormatValue(this.powerSliderComponent.value, 'A', 'kW', this.powerDigitPrecision, this.powerFloatingPrecision, this.numberOfConnectedPhase, this.appUnitFormatter);
        break;
      default:
        break;
    }
  }

  public getDisplayedValue() {
    return this.powerSliderValue;
  }  
}
