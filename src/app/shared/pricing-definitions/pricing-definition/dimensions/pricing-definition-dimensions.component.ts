import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import PricingDefinition, {
  DimensionType,
  PricingDimension,
  PricingDimensions,
} from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingHelpers } from '../../../../utils/PricingHelpers';

@Component({
  selector: 'app-pricing-definition-dimensions',
  templateUrl: 'pricing-definition-dimensions.component.html',
})
export class PricingDefinitionDimensionsComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public pricingDefinition: PricingDefinition;
  @Input() public readOnly: boolean;

  public initialized = false;

  // Dimensions
  public dimensions!: UntypedFormGroup;
  // Flat fee
  public flatFeeDimension: UntypedFormGroup;
  public flatFeeEnabled: AbstractControl;
  public flatFee: AbstractControl;
  // Energy
  public energyDimension: UntypedFormGroup;
  public energyEnabled: AbstractControl;
  public energy: AbstractControl;
  // Charging time
  public chargingTimeDimension: UntypedFormGroup;
  public chargingTimeEnabled: AbstractControl;
  public chargingTime: AbstractControl;
  // Parking time
  public parkingTimeDimension: UntypedFormGroup;
  public parkingTimeEnabled: AbstractControl;
  public parkingTime: AbstractControl;
  // Step size
  public energyStepEnabled: AbstractControl;
  public energyStep: AbstractControl;
  public chargingTimeStepEnabled: AbstractControl;
  public chargingTimeStep: AbstractControl;
  public parkingTimeStepEnabled: AbstractControl;
  public parkingTimeStep: AbstractControl;

  public ngOnInit(): void {
    this.formGroup.addControl(
      'dimensions',
      new UntypedFormGroup({
        flatFee: new UntypedFormGroup({
          flatFeeEnabled: new UntypedFormControl(false),
          price: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
          ),
        }),
        energy: new UntypedFormGroup({
          energyEnabled: new UntypedFormControl(false),
          price: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
            ])
          ),
          stepSize: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_NUMBER),
            ])
          ),
          stepSizeEnabled: new UntypedFormControl({ value: false, disabled: true }),
        }),
        chargingTime: new UntypedFormGroup({
          chargingTimeEnabled: new UntypedFormControl(false),
          price: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
            ])
          ),
          stepSize: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_NUMBER),
            ])
          ),
          stepSizeEnabled: new UntypedFormControl({ value: false, disabled: true }),
        }),
        parkingTime: new UntypedFormGroup({
          parkingTimeEnabled: new UntypedFormControl(false),
          price: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
            ])
          ),
          stepSize: new UntypedFormControl(
            { value: null, disabled: true },
            Validators.compose([
              Validators.required,
              Validators.pattern(Constants.REGEX_VALIDATION_NUMBER),
            ])
          ),
          stepSizeEnabled: new UntypedFormControl({ value: false, disabled: true }),
        }),
      })
    );
    // Dimensions
    this.dimensions = this.formGroup.controls['dimensions'] as UntypedFormGroup;
    this.flatFeeDimension = this.dimensions.controls['flatFee'] as UntypedFormGroup;
    this.flatFeeEnabled = this.flatFeeDimension.controls['flatFeeEnabled'];
    this.flatFee = this.flatFeeDimension.controls['price'];
    this.energyDimension = this.dimensions.controls['energy'] as UntypedFormGroup;
    this.energyEnabled = this.energyDimension.controls['energyEnabled'];
    this.energy = this.energyDimension.controls['price'];
    this.energyStepEnabled = this.energyDimension.controls['stepSizeEnabled'];
    this.energyStep = this.energyDimension.controls['stepSize'];
    this.chargingTimeDimension = this.dimensions.controls['chargingTime'] as UntypedFormGroup;
    this.chargingTimeEnabled = this.chargingTimeDimension.controls['chargingTimeEnabled'];
    this.chargingTime = this.chargingTimeDimension.controls['price'];
    this.chargingTimeStepEnabled = this.chargingTimeDimension.controls['stepSizeEnabled'];
    this.chargingTimeStep = this.chargingTimeDimension.controls['stepSize'];
    this.parkingTimeDimension = this.dimensions.controls['parkingTime'] as UntypedFormGroup;
    this.parkingTimeEnabled = this.parkingTimeDimension.controls['parkingTimeEnabled'];
    this.parkingTime = this.parkingTimeDimension.controls['price'];
    this.parkingTimeStepEnabled = this.parkingTimeDimension.controls['stepSizeEnabled'];
    this.parkingTimeStep = this.parkingTimeDimension.controls['stepSize'];
    this.initialized = true;
    this.loadPricingDefinition();
  }

  public ngOnChanges() {
    this.loadPricingDefinition();
  }

  public loadPricingDefinition() {
    if (this.initialized && this.pricingDefinition) {
      this.initializeDimension(this.pricingDefinition, DimensionType.FLAT_FEE);
      this.initializeDimension(this.pricingDefinition, DimensionType.ENERGY);
      this.initializeDimension(this.pricingDefinition, DimensionType.CHARGING_TIME, true);
      this.initializeDimension(this.pricingDefinition, DimensionType.PARKING_TIME, true);
    }
  }

  public toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this[event.source.id].enable();
      this[`${event.source.id}StepEnabled`]?.enable();
      if (this[`${event.source.id}StepEnabled`]?.value) {
        this[`${event.source.id}Step`].enable();
      }
    } else {
      this[event.source.id].disable();
      this[`${event.source.id}StepEnabled`]?.disable();
      this[`${event.source.id}Step`]?.disable();
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public buildPricingDimensions(): PricingDimensions {
    return {
      flatFee: this.flatFeeEnabled.value
        ? this.buildPricingDimension(DimensionType.FLAT_FEE)
        : null,
      energy: this.energyEnabled.value ? this.buildPricingDimension(DimensionType.ENERGY) : null,
      chargingTime: this.chargingTimeEnabled.value
        ? this.buildPricingDimension(DimensionType.CHARGING_TIME, true)
        : null,
      parkingTime: this.parkingTimeEnabled.value
        ? this.buildPricingDimension(DimensionType.PARKING_TIME, true)
        : null,
    };
  }

  private initializeDimension(
    pricingDefinition: PricingDefinition,
    dimensionType: DimensionType,
    isTimeDimension = false
  ): void {
    const dimension: PricingDimension = pricingDefinition.dimensions?.[dimensionType];
    if (!!dimension?.active) {
      this[`${dimensionType}Enabled`].setValue(true);
      this[`${dimensionType}StepEnabled`]?.enable();
      this[dimensionType].enable();
      this[dimensionType].setValue(dimension?.price);
    }
    if (!!dimension?.stepSize) {
      this[`${dimensionType}StepEnabled`].enable();
      this[`${dimensionType}StepEnabled`].setValue(true);
      const stepSize = isTimeDimension
        ? PricingHelpers.toMinutes(dimension?.stepSize)
        : dimension?.stepSize;
      this[`${dimensionType}Step`].enable();
      this[`${dimensionType}Step`].setValue(stepSize);
    }
  }

  private buildPricingDimension(
    dimensionType: DimensionType,
    isTimeDimension = false
  ): PricingDimension {
    const price: number = this[dimensionType].value;
    let dimension: PricingDimension;
    if (price) {
      // Dimension
      dimension = {
        active: true,
        price,
      };
    }
    const withStep: boolean =
      this[`${dimensionType}StepEnabled`]?.value && this[`${dimensionType}Enabled`].value;
    if (withStep) {
      let stepSize = this[`${dimensionType}Step`]?.value;
      if (isTimeDimension) {
        // Converts minutes shown in the UI into seconds (as expected by the pricing model)
        stepSize = PricingHelpers.toSeconds(stepSize);
      }
      // Dimension with Step Size
      dimension.stepSize = stepSize;
    }
    return dimension;
  }
}
