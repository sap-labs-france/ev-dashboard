import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONNECTOR_TYPE_SELECTION_MAP } from 'shared/formatters/app-connector-type-selection.pipe';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import { Entity } from '../../../../types/Authorization';
import { ActionResponse } from '../../../../types/DataResult';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import PricingDefinition, { DimensionType, PricingDimension, PricingDimensions, PricingEntity, PricingRestriction, PricingStaticRestriction } from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingHelpers } from '../../../../utils/PricingHelpers';
import { Utils } from '../../../../utils/Utils';
import { PricingDefinitionDialogComponent } from './../pricing-definition.dialog.component';

@Component({
  selector: 'app-pricing-definition-restrictions',
  templateUrl: './pricing-definition-restrictions.component.html',
})

export class PricingDefinitionRestricitionsComponent implements OnInit, OnChanges {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: string;
  @Input() public currentEntityName: string;
  @Input() public formGroup!: FormGroup;
  @Input() public currentPricingDefinition: PricingDefinition;

  // public currentPricingDefinition: PricingDefinition;
  public context: string;
  // // Controls general
  public id: AbstractControl;
  // public name: AbstractControl;
  // public description: AbstractControl;
  // public entityType: AbstractControl;
  // public entityID: AbstractControl;
  // // Connector
  // public connectorTypeMap = CONNECTOR_TYPE_SELECTION_MAP;
  // public connectorPowerValue: AbstractControl;
  // public connectorPowerUnit: AbstractControl;
  // // Static Restrictions
  // public staticRestrictions!: FormGroup;
  // public connectorType!: AbstractControl;
  // public validFrom: AbstractControl;
  // public validTo: AbstractControl;
  // public minDate: Date;
  public minTime: string;
  // public connectorPowerEnabled!: AbstractControl;
  // // Dimensions
  // public dimensions!: FormGroup;
  // // Flat fee
  // public flatFee: FormGroup;
  // public flatFeeEnabled: AbstractControl;
  // public flatFeeValue: AbstractControl;
  // public flatFeeUnit: AbstractControl;
  // // Energy
  // public energy: FormGroup;
  // public energyEnabled: AbstractControl;
  // public energyValue: AbstractControl;
  // public energyUnit: AbstractControl;
  // public energyStepEnabled: AbstractControl;
  // public energyStepValue: AbstractControl;
  // public energyStepUnit: AbstractControl;
  // // Charging time
  // public chargingTime: FormGroup;
  // public chargingTimeEnabled: AbstractControl;
  // public chargingTimeValue: AbstractControl;
  // public chargingTimeUnit: AbstractControl;
  // // Parking time
  // public parkingTime: FormGroup;
  // public parkingTimeEnabled: AbstractControl;
  // public parkingTimeValue: AbstractControl;
  // public parkingTimeUnit: AbstractControl;
  // // Step size
  // public chargingTimeStepEnabled: AbstractControl;
  // public chargingTimeStepValue: AbstractControl;
  // public chargingTimeStepUnit: AbstractControl;
  // public parkingTimeStepEnabled: AbstractControl;
  // public parkingTimeStepValue: AbstractControl;
  // public parkingTimeStepUnit: AbstractControl;
  // Restrictions
  public restrictions!: FormGroup;
  // Duration
  public minDurationEnabled: AbstractControl;
  public minDuration: AbstractControl;
  public maxDurationEnabled: AbstractControl;
  public maxDuration: AbstractControl;
  // Energy KWh
  public minEnergyKWhEnabled: AbstractControl;
  public minEnergyKWhValue: AbstractControl;
  public maxEnergyKWhEnabled: AbstractControl;
  public maxEnergyKWhValue: AbstractControl;
  // Days of week
  public daysOfWeekEnabled: AbstractControl;
  public selectedDays: AbstractControl;
  public daysOfTheWeek = [1, 2, 3, 4, 5, 6, 7];
  // Start/end date time
  public timeRangeEnabled: AbstractControl;
  public timeFromValue: AbstractControl;
  public timeToValue: AbstractControl;

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
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl('restrictions', new FormGroup({
      minDurationEnabled: new FormControl(false),
      minDuration: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
      maxDurationEnabled: new FormControl(false),
      maxDuration: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
      minEnergyKWhEnabled: new FormControl(false),
      minEnergyKWh: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
      maxEnergyKWhEnabled: new FormControl(false),
      maxEnergyKWh: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)),
      timeRangeEnabled: new FormControl(false),
      timeFrom: new FormControl(null),
      timeTo: new FormControl(null),
      daysOfWeekEnabled: new FormControl(false),
      selectedDays: new FormControl(null),
    }));
    this.id = this.formGroup.controls['id'];
    this.restrictions = this.formGroup.controls['restrictions'] as FormGroup;
    this.minDurationEnabled = this.restrictions.controls['minDurationEnabled'];
    this.minDuration = this.restrictions.controls['minDuration'];
    this.maxDurationEnabled = this.restrictions.controls['maxDurationEnabled'];
    this.maxDuration = this.restrictions.controls['maxDuration'];
    this.minEnergyKWhEnabled = this.restrictions.controls['minEnergyKWhEnabled'];
    this.minEnergyKWhValue = this.restrictions.controls['minEnergyKWh'];
    this.maxEnergyKWhEnabled = this.restrictions.controls['maxEnergyKWhEnabled'];
    this.maxEnergyKWhValue = this.restrictions.controls['maxEnergyKWh'];
    this.daysOfWeekEnabled = this.restrictions.controls['daysOfWeekEnabled'];
    this.selectedDays = this.restrictions.controls['selectedDays'];
    this.timeRangeEnabled = this.restrictions.controls['timeRangeEnabled'];
    this.timeFromValue = this.restrictions.controls['timeFrom'];
    this.timeToValue = this.restrictions.controls['timeTo'];
    this.timeFromValue.valueChanges.subscribe(() => {
      if(this.timeToValue.value && this.timeFromValue.value === this.timeToValue.value){
        this.timeFromValue.setErrors({timeRangeError: true});
        this.formGroup.markAsPristine();
      }
    });
    this.timeToValue.valueChanges.subscribe(() => {
      if(this.timeFromValue.value && this.timeFromValue.value === this.timeToValue.value){
        this.timeToValue.setErrors({timeRangeError: true});
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
      this.timeRangeEnabled.setValue(!!this.currentPricingDefinition.restrictions?.timeFrom);
      this.timeFromValue.setValue(this.currentPricingDefinition.restrictions?.timeFrom);
      this.minTime = this.currentPricingDefinition.restrictions?.timeTo;
      this.timeToValue.setValue(this.currentPricingDefinition.restrictions?.timeTo);
      this.minDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minDurationSecs);
      this.minDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.minDurationSecs));
      this.maxDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxDurationSecs);
      this.maxDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.maxDurationSecs));
      this.minEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minEnergyKWh);
      this.minEnergyKWhValue.setValue(this.currentPricingDefinition.restrictions?.minEnergyKWh);
      this.maxEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxEnergyKWh);
      this.maxEnergyKWhValue.setValue(this.currentPricingDefinition.restrictions?.maxEnergyKWh);
      // Force refresh the form
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
  }

  public toggleDaysOfWeek(event: MatSlideToggleChange) {
    this.daysOfWeekEnabled.setValue(event.checked);
    if(event.checked) {
      this.selectedDays.setValidators(Validators.required);
    } else {
      this.clearAndResetControl(this.selectedDays);
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public toggleTimeRange(event: MatSlideToggleChange) {
    this.timeRangeEnabled.setValue(event.checked);
    if (event.checked) {
      this.timeFromValue.setValidators(Validators.required);
      this.timeToValue.setValidators(Validators.required);
    } else {
      this.clearAndResetControl(this.timeFromValue);
      this.clearAndResetControl(this.timeToValue);
    }
    this.timeFromValue.markAsDirty();
    this.timeToValue.markAsDirty();
    this.timeFromValue.updateValueAndValidity();
    this.timeToValue.updateValueAndValidity();
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

  private clearAndResetControl(control: AbstractControl) {
    control.reset();
    control.clearValidators();
    control.updateValueAndValidity();
  }
}
