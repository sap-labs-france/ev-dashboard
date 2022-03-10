import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import PricingDefinition, { DimensionType, PricingDimension } from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingHelpers } from '../../../../utils/PricingHelpers';

@Component({
  selector: 'app-pricing-definition-dimensions',
  templateUrl: './pricing-definition-dimensions.component.html',
})

export class PricingDefinitionDimensionsComponent implements OnInit, OnChanges {
  @Input() public formGroup!: FormGroup;
  @Input() public currentPricingDefinition: PricingDefinition;

  // Dimensions
  public dimensions!: FormGroup;
  // Flat fee
  public flatFeeDimension: FormGroup;
  public flatFeeEnabled: AbstractControl;
  public flatFee: AbstractControl;
  // Energy
  public energyDimension: FormGroup;
  public energyEnabled: AbstractControl;
  public energy: AbstractControl;
  // Charging time
  public chargingTimeDimension: FormGroup;
  public chargingTimeEnabled: AbstractControl;
  public chargingTime: AbstractControl;
  // Parking time
  public parkingTimeDimension: FormGroup;
  public parkingTimeEnabled: AbstractControl;
  public parkingTime: AbstractControl;
  // Step size
  public energyStepEnabled: AbstractControl;
  public energyStep: AbstractControl;
  public chargingTimeStepEnabled: AbstractControl;
  public chargingTimeStep: AbstractControl;
  public parkingTimeStepEnabled: AbstractControl;
  public parkingTimeStep: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit(): void {
    this.formGroup.addControl('dimensions', new FormGroup({
      flatFee: new FormGroup({
        flatFeeEnabled: new FormControl(false),
        price: new FormControl({value: null, disabled: true}, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
      }),
      energy: new FormGroup({
        energyEnabled: new FormControl(false),
        price: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
        ])),
        stepSize: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        stepSizeEnabled: new FormControl(false)
      }),
      chargingTime: new FormGroup({
        chargingTimeEnabled: new FormControl(false),
        price: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
        ])),
        stepSize: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        stepSizeEnabled: new FormControl(false)
      }),
      parkingTime: new FormGroup({
        parkingTimeEnabled: new FormControl(false),
        price: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
        ])),
        stepSize: new FormControl({value: null, disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        stepSizeEnabled: new FormControl(false)
      }),
    }));
    // Dimensions
    this.dimensions = this.formGroup.controls['dimensions'] as FormGroup;
    this.flatFeeDimension = this.dimensions.controls['flatFee'] as FormGroup;
    this.flatFeeEnabled = this.flatFeeDimension.controls['flatFeeEnabled'];
    this.flatFee = this.flatFeeDimension.controls['price'];
    this.energyDimension = this.dimensions.controls['energy'] as FormGroup;
    this.energyEnabled = this.energyDimension.controls['energyEnabled'];
    this.energy = this.energyDimension.controls['price'];
    this.energyStepEnabled = this.energyDimension.controls['stepSizeEnabled'];
    this.energyStep = this.energyDimension.controls['stepSize'];
    this.chargingTimeDimension = this.dimensions.controls['chargingTime'] as FormGroup;
    this.chargingTimeEnabled = this.chargingTimeDimension.controls['chargingTimeEnabled'];
    this.chargingTime = this.chargingTimeDimension.controls['price'];
    this.chargingTimeStepEnabled = this.chargingTimeDimension.controls['stepSizeEnabled'];
    this.chargingTimeStep = this.chargingTimeDimension.controls['stepSize'];
    this.parkingTimeDimension = this.dimensions.controls['parkingTime'] as FormGroup;
    this.parkingTimeEnabled = this.parkingTimeDimension.controls['parkingTimeEnabled'];
    this.parkingTime = this.parkingTimeDimension.controls['price'];
    this.parkingTimeStepEnabled = this.parkingTimeDimension.controls['stepSizeEnabled'];
    this.parkingTimeStep = this.parkingTimeDimension.controls['stepSize'];
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges(): void {
    this.loadPricing();
  }

  public toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this[event.source.id].enable();
    } else {
      this[event.source.id].disable();
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public loadPricing() {
    if (this.currentPricingDefinition) {
      // Dimensions
      this.initializeDimensions(this.currentPricingDefinition);
      // Force refresh the form
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
  }

  private initializeDimensions(pricingDefinition: PricingDefinition): void {
    this.initializeDimension(pricingDefinition, DimensionType.FLAT_FEE);
    this.initializeDimension(pricingDefinition, DimensionType.ENERGY);
    this.initializeDimension(pricingDefinition, DimensionType.CHARGING_TIME, true);
    this.initializeDimension(pricingDefinition, DimensionType.PARKING_TIME, true);
  }

  private initializeDimension(pricingDefinition: PricingDefinition, dimensionType: DimensionType, isTimeDimension = false): void {
    const dimension: PricingDimension = pricingDefinition.dimensions?.[dimensionType];
    if (!!dimension?.active) {
      this[`${dimensionType}Enabled`].setValue(true);
      this[dimensionType].enable();
      this[dimensionType].setValue(dimension?.price);
    }
    if (!!dimension?.stepSize) {
      this[`${dimensionType}StepEnabled`].setValue(true);
      const stepSize = (isTimeDimension) ? PricingHelpers.toMinutes(dimension?.stepSize) : dimension?.stepSize;
      this[`${dimensionType}Step`].enable();
      this[`${dimensionType}Step`].setValue(stepSize);
    }
  }
}