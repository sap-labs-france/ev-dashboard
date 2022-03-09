import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import PricingDefinition from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingHelpers } from '../../../../utils/PricingHelpers';

@Component({
  selector: 'app-pricing-definition-restrictions',
  templateUrl: './pricing-definition-restrictions.component.html',
})

export class PricingDefinitionRestrictionsComponent implements OnInit, OnChanges {
  @Input() public formGroup!: FormGroup;
  @Input() public currentPricingDefinition: PricingDefinition;

  // Restrictions
  public restrictions!: FormGroup;
  // Duration
  public minDurationEnabled: AbstractControl;
  public minDuration: AbstractControl;
  public maxDurationEnabled: AbstractControl;
  public maxDuration: AbstractControl;
  // Energy KWh
  public minEnergyKWhEnabled: AbstractControl;
  public minEnergyKWh: AbstractControl;
  public maxEnergyKWhEnabled: AbstractControl;
  public maxEnergyKWh: AbstractControl;
  // Days of week
  public daysOfWeekEnabled: AbstractControl;
  public selectedDays: AbstractControl;
  public daysOfTheWeek = [1, 2, 3, 4, 5, 6, 7];
  // Start/end date time
  public timeRangeEnabled: AbstractControl;
  public timeFrom: AbstractControl;
  public timeTo: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public translateService: TranslateService,
    public dayPipe: AppDayPipe) {
  }

  public ngOnInit(): void {
    this.formGroup.addControl('restrictions', new FormGroup({
      minDurationEnabled: new FormControl(false),
      minDuration: new FormControl({value: null, disabled: true}, PricingHelpers.minMaxValidator('minDuration', 'maxDuration')),
      maxDurationEnabled: new FormControl(false),
      maxDuration: new FormControl({value: null, disabled: true}, PricingHelpers.minMaxValidator('minDuration', 'maxDuration')),
      minEnergyKWhEnabled: new FormControl(false),
      minEnergyKWh: new FormControl({value: null, disabled: true}, PricingHelpers.minMaxValidator('minEnergyKWh', 'maxEnergyKWh')),
      maxEnergyKWhEnabled: new FormControl(false),
      maxEnergyKWh: new FormControl({value: null, disabled: true}, PricingHelpers.minMaxValidator('minEnergyKWh', 'maxEnergyKWh')),
      timeRangeEnabled: new FormControl(false),
      timeFrom: new FormControl({value: null, disabled: true}, Validators.required),
      timeTo: new FormControl({value: null, disabled: true}, Validators.required),
      daysOfWeekEnabled: new FormControl(false),
      selectedDays: new FormControl({value: null, disabled: true}, Validators.required),
    }));
    this.restrictions = this.formGroup.controls['restrictions'] as FormGroup;
    this.minDurationEnabled = this.restrictions.controls['minDurationEnabled'];
    this.minDuration = this.restrictions.controls['minDuration'];
    this.maxDurationEnabled = this.restrictions.controls['maxDurationEnabled'];
    this.maxDuration = this.restrictions.controls['maxDuration'];
    this.minEnergyKWhEnabled = this.restrictions.controls['minEnergyKWhEnabled'];
    this.minEnergyKWh = this.restrictions.controls['minEnergyKWh'];
    this.maxEnergyKWhEnabled = this.restrictions.controls['maxEnergyKWhEnabled'];
    this.maxEnergyKWh = this.restrictions.controls['maxEnergyKWh'];
    this.daysOfWeekEnabled = this.restrictions.controls['daysOfWeekEnabled'];
    this.selectedDays = this.restrictions.controls['selectedDays'];
    this.timeRangeEnabled = this.restrictions.controls['timeRangeEnabled'];
    this.timeFrom = this.restrictions.controls['timeFrom'];
    this.timeTo = this.restrictions.controls['timeTo'];
    this.timeFrom.valueChanges.subscribe(() => {
      if(this.timeTo.value && this.timeFrom.value === this.timeTo.value){
        this.timeFrom.setErrors({timeRangeError: true});
        this.formGroup.markAsPristine();
      }
    });
    this.timeTo.valueChanges.subscribe(() => {
      if(this.timeFrom.value && this.timeFrom.value === this.timeTo.value){
        this.timeTo.setErrors({timeRangeError: true});
        this.formGroup.markAsPristine();
      }
    });
    this.formGroup.updateValueAndValidity();
    this.loadPricing();
  }

  public ngOnChanges(): void {
    // Load
    this.loadPricing();
  }

  public loadPricing() {
    if (this.currentPricingDefinition) {
      // Restrictions
      this.daysOfWeekEnabled.setValue(!!this.currentPricingDefinition.restrictions?.daysOfWeek);
      this.selectedDays.setValue(this.currentPricingDefinition.restrictions?.daysOfWeek?.map((day) => day.toString()) || null);
      if (!!this.currentPricingDefinition.restrictions?.daysOfWeek) {
        this.selectedDays.setValue(this.currentPricingDefinition.restrictions?.daysOfWeek?.map((day) => day.toString()) || null);
        this.selectedDays.enable();
      }
      this.timeRangeEnabled.setValue(!!this.currentPricingDefinition.restrictions?.timeFrom);
      if (!!this.currentPricingDefinition.restrictions?.timeFrom) {
        this.timeFrom.setValue(this.currentPricingDefinition.restrictions?.timeFrom);
        this.timeFrom.enable();
      }
      if (!!this.currentPricingDefinition.restrictions?.timeTo) {
        this.timeTo.setValue(this.currentPricingDefinition.restrictions?.timeTo);
        this.timeTo.enable();
      }
      this.minDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minDurationSecs);
      if (!!this.currentPricingDefinition.restrictions?.minDurationSecs) {
        this.minDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.minDurationSecs));
        this.minDuration.enable();
      }
      this.maxDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxDurationSecs);
      if (!!this.currentPricingDefinition.restrictions?.maxDurationSecs) {
        this.maxDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.maxDurationSecs));
        this.maxDuration.enable();
      }
      this.minEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minEnergyKWh);
      if (!!this.currentPricingDefinition.restrictions?.minEnergyKWh) {
        this.minEnergyKWh.setValue(this.currentPricingDefinition.restrictions?.minEnergyKWh);
        this.minEnergyKWh.enable();
      }
      this.maxEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxEnergyKWh);
      if (!!this.currentPricingDefinition.restrictions?.maxEnergyKWh) {
        this.maxEnergyKWh.setValue(this.currentPricingDefinition.restrictions?.maxEnergyKWh);
        this.maxEnergyKWh.enable();
      }
      // Force refresh the form
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
  }

  public toggleDaysOfWeek(event: MatSlideToggleChange) {
    if (event.checked) {
      this.selectedDays.enable();
    } else {
      this.selectedDays.disable();
    }
    this.selectedDays.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  public toggleTimeRange(event: MatSlideToggleChange) {
    if (event.checked) {
      this.timeFrom.enable();
      this.timeTo.enable();
    } else {
      this.timeFrom.disable();
      this.timeTo.disable();
    }
    this.timeFrom.updateValueAndValidity();
    this.timeTo.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  public toggleDuration(event: MatSlideToggleChange) {
    if (event.checked) {
      this[event.source.id].enable();
    } else {
      this[event.source.id].disable();
    }
    this.minDuration.updateValueAndValidity();
    this.maxDuration.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  public toggleEnergy(event: MatSlideToggleChange) {
    if (event.checked) {
      this[event.source.id].enable();
    } else {
      this[event.source.id].disable();
    }
    this.minEnergyKWh.updateValueAndValidity();
    this.maxEnergyKWh.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }
}
