import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import PricingDefinition, { DayOfWeek, PricingRestriction } from '../../../../types/Pricing';
import { PricingHelpers } from '../../../../utils/PricingHelpers';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-pricing-definition-restrictions',
  templateUrl: 'pricing-definition-restrictions.component.html',
})
export class PricingDefinitionRestrictionsComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public pricingDefinition: PricingDefinition;
  @Input() public readOnly: boolean;

  public initialized = false;

  // Restrictions
  public restrictions!: UntypedFormGroup;
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
  public constructor(public translateService: TranslateService, public dayPipe: AppDayPipe) {}

  public ngOnInit(): void {
    this.formGroup.addControl(
      'restrictions',
      new UntypedFormGroup({
        minDurationEnabled: new UntypedFormControl(false),
        minDuration: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.minValidator('maxDuration')
        ),
        maxDurationEnabled: new UntypedFormControl(false),
        maxDuration: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.maxValidator('minDuration', 'maxDuration')
        ),
        minEnergyKWhEnabled: new UntypedFormControl(false),
        minEnergyKWh: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.minValidator('maxEnergyKWh')
        ),
        maxEnergyKWhEnabled: new UntypedFormControl(false),
        maxEnergyKWh: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.maxValidator('minEnergyKWh', 'maxEnergyKWh')
        ),
        timeRangeEnabled: new UntypedFormControl(false),
        timeFrom: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.minTimeValidator('timeTo')
        ),
        timeTo: new UntypedFormControl(
          { value: null, disabled: true },
          PricingHelpers.maxTimeValidator('timeFrom', 'timeTo')
        ),
        daysOfWeekEnabled: new UntypedFormControl(false),
        selectedDays: new UntypedFormControl({ value: null, disabled: true }, Validators.required),
      })
    );
    this.restrictions = this.formGroup.controls['restrictions'] as UntypedFormGroup;
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
      if (this.timeTo.value && this.timeFrom.value === this.timeTo.value) {
        this.timeFrom.setErrors({ timeRangeError: true });
        this.formGroup.markAsPristine();
      }
    });
    this.timeTo.valueChanges.subscribe(() => {
      if (this.timeFrom.value && this.timeFrom.value === this.timeTo.value) {
        this.timeTo.setErrors({ timeRangeError: true });
        this.formGroup.markAsPristine();
      }
    });
    this.initialized = true;
    this.loadPricingDefinition();
  }

  public ngOnChanges() {
    this.loadPricingDefinition();
  }

  public loadPricingDefinition() {
    if (this.initialized && this.pricingDefinition) {
      // Restrictions
      if (!!this.pricingDefinition.restrictions?.daysOfWeek) {
        this.daysOfWeekEnabled.setValue(true);
        this.selectedDays.setValue(
          this.pricingDefinition.restrictions?.daysOfWeek?.map((day) => day.toString()) || null
        );
        this.selectedDays.enable();
      }
      if (!!this.pricingDefinition.restrictions?.timeFrom) {
        this.timeRangeEnabled.setValue(true);
        this.timeFrom.setValue(this.pricingDefinition.restrictions?.timeFrom);
        this.timeFrom.enable();
        if (!!this.pricingDefinition.restrictions?.timeTo) {
          this.timeTo.setValue(this.pricingDefinition.restrictions?.timeTo);
          this.timeTo.enable();
        }
      }
      if (!!this.pricingDefinition.restrictions?.minDurationSecs) {
        this.minDurationEnabled.setValue(true);
        this.minDuration.setValue(
          PricingHelpers.toMinutes(this.pricingDefinition.restrictions?.minDurationSecs)
        );
        this.minDuration.enable();
      }
      if (!!this.pricingDefinition.restrictions?.maxDurationSecs) {
        this.maxDurationEnabled.setValue(true);
        this.maxDuration.setValue(
          PricingHelpers.toMinutes(this.pricingDefinition.restrictions?.maxDurationSecs)
        );
        this.maxDuration.enable();
      }
      if (!!this.pricingDefinition.restrictions?.minEnergyKWh) {
        this.minEnergyKWhEnabled.setValue(true);
        this.minEnergyKWh.setValue(this.pricingDefinition.restrictions?.minEnergyKWh);
        this.minEnergyKWh.enable();
      }
      if (!!this.pricingDefinition.restrictions?.maxEnergyKWh) {
        this.maxEnergyKWhEnabled.setValue(true);
        this.maxEnergyKWh.setValue(this.pricingDefinition.restrictions?.maxEnergyKWh);
        this.maxEnergyKWh.enable();
      }
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

  public buildPricingRestrictions(): PricingRestriction {
    const restrictions: PricingRestriction = {
      daysOfWeek: this.daysOfWeekEnabled.value
        ? this.selectedDays.value.sort((day1: DayOfWeek, day2: DayOfWeek) => day1 - day2)
        : null,
      timeFrom: this.timeRangeEnabled.value ? this.timeFrom.value : null,
      timeTo: this.timeRangeEnabled.value ? this.timeTo.value : null,
      minEnergyKWh: this.minEnergyKWhEnabled.value ? this.minEnergyKWh.value : null,
      maxEnergyKWh: this.maxEnergyKWhEnabled.value ? this.maxEnergyKWh.value : null,
      minDurationSecs: this.minDurationEnabled.value
        ? PricingHelpers.convertDurationToSeconds(
          this.minDurationEnabled.value,
          this.minDuration.value
        )
        : null,
      maxDurationSecs: this.maxDurationEnabled.value
        ? PricingHelpers.convertDurationToSeconds(
          this.maxDurationEnabled.value,
          this.maxDuration.value
        )
        : null,
    };
    return Utils.shrinkObjectProperties(restrictions);
  }
}
