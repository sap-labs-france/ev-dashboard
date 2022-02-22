import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import { Entity } from '../../../../types/Authorization';
import PricingDefinition, { DimensionType, PricingDimension } from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingHelpers } from '../../../../utils/PricingHelpers';
import { PricingDefinitionDialogComponent } from './../pricing-definition.dialog.component';

@Component({
  selector: 'app-pricing-definition-dimensions',
  templateUrl: './pricing-definition-dimensions.component.html',
})

export class PricingDefinitionDimensionsComponent implements OnInit, OnChanges {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: string;
  @Input() public currentEntityName: string;
  @Input() public formGroup!: FormGroup;
  @Input() public pricingDefinition: PricingDefinition;
  @Input() public currentPricingDefinition: PricingDefinition;

  public context: string;
  // Dimensions
  public dimensions!: FormGroup;
  // Flat fee
  public flatFee: FormGroup;
  public flatFeeEnabled: AbstractControl;
  public flatFeeValue: AbstractControl;
  public flatFeeUnit: AbstractControl;
  // Energy
  public energy: FormGroup;
  public energyEnabled: AbstractControl;
  public energyValue: AbstractControl;
  public energyUnit: AbstractControl;
  public energyStepEnabled: AbstractControl;
  public energyStepValue: AbstractControl;
  public energyStepUnit: AbstractControl;
  // Charging time
  public chargingTime: FormGroup;
  public chargingTimeEnabled: AbstractControl;
  public chargingTimeValue: AbstractControl;
  public chargingTimeUnit: AbstractControl;
  // Parking time
  public parkingTime: FormGroup;
  public parkingTimeEnabled: AbstractControl;
  public parkingTimeValue: AbstractControl;
  public parkingTimeUnit: AbstractControl;
  // Step size
  public chargingTimeStepEnabled: AbstractControl;
  public chargingTimeStepValue: AbstractControl;
  public chargingTimeStepUnit: AbstractControl;
  public parkingTimeStepEnabled: AbstractControl;
  public parkingTimeStepValue: AbstractControl;
  public parkingTimeStepUnit: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    public translateService: TranslateService,
    public dayPipe: AppDayPipe) {
  }

  public ngOnInit(): void {
    this.context = this.currentEntityType === Entity.TENANT ? this.centralServerService.getLoggedUser().tenantName : this.currentEntityName;
    this.formGroup.addControl('dimensions', new FormGroup({
      flatFee: new FormGroup({
        active: new FormControl(false),
        price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
      }),
      energy: new FormGroup({
        active: new FormControl(false),
        price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
        stepSize: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
        stepSizeEnabled: new FormControl(false)
      }),
      chargingTime: new FormGroup({
        active: new FormControl(false),
        price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
        stepSize: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
        stepSizeEnabled: new FormControl(false)
      }),
      parkingTime: new FormGroup({
        active: new FormControl(false),
        price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
        stepSize: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
        stepSizeEnabled: new FormControl(false)
      }),
    }));
    // Dimensions
    this.dimensions = this.formGroup.controls['dimensions'] as FormGroup;
    this.flatFee = this.dimensions.controls['flatFee'] as FormGroup;
    this.flatFeeEnabled = this.flatFee.controls['active'];
    this.flatFeeValue = this.flatFee.controls['price'];
    this.flatFeeUnit = this.flatFee.controls['unit'];
    this.energy = this.dimensions.controls['energy'] as FormGroup;
    this.energyEnabled = this.energy.controls['active'];
    this.energyValue = this.energy.controls['price'];
    this.energyUnit = this.energy.controls['unit'];
    this.energyStepEnabled = this.energy.controls['stepSizeEnabled'];
    this.energyStepValue = this.energy.controls['stepSize'];
    this.energyStepUnit = this.energy.controls['stepSizeUnit'];
    this.chargingTime = this.dimensions.controls['chargingTime'] as FormGroup;
    this.chargingTimeEnabled = this.chargingTime.controls['active'];
    this.chargingTimeValue = this.chargingTime.controls['price'];
    this.chargingTimeUnit = this.chargingTime.controls['unit'];
    this.chargingTimeStepEnabled = this.chargingTime.controls['stepSizeEnabled'];
    this.chargingTimeStepValue = this.chargingTime.controls['stepSize'];
    this.chargingTimeStepUnit = this.chargingTime.controls['stepSizeUnit'];
    this.parkingTime = this.dimensions.controls['parkingTime'] as FormGroup;
    this.parkingTimeEnabled = this.parkingTime.controls['active'];
    this.parkingTimeValue = this.parkingTime.controls['price'];
    this.parkingTimeUnit = this.parkingTime.controls['unit'];
    this.parkingTimeStepEnabled = this.parkingTime.controls['stepSizeEnabled'];
    this.parkingTimeStepValue = this.parkingTime.controls['stepSize'];
    this.parkingTimeStepUnit = this.parkingTime.controls['stepSizeUnit'];
    this.formGroup.updateValueAndValidity();
    this.loadPricing();
  }

  public ngOnChanges(): void {
    this.loadPricing();
  }

  public toggle(event: MatSlideToggleChange) {
    this[`${event.source.id}Enabled`].setValue(event.checked);
    if (event.checked) {
      this[`${event.source.id}Value`].setValidators(Validators.compose([
        Validators.required,
        Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
      ]));
    } else {
      this.clearAndResetControl(this[`${event.source.id}Value`]);
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
    this[`${dimensionType}Enabled`].setValue(!!dimension?.active);
    this[`${dimensionType}Value`].setValue(dimension?.price);
    if (!!dimension?.stepSize) {
      this[`${dimensionType}StepEnabled`].setValue(true);
      const stepSize = (isTimeDimension)?PricingHelpers.toMinutes(dimension?.stepSize):dimension?.stepSize;
      this[`${dimensionType}StepValue`].setValue(stepSize);
    }
  }

  private clearAndResetControl(control: AbstractControl) {
    control.reset();
    control.clearValidators();
    control.updateValueAndValidity();
  }
}
