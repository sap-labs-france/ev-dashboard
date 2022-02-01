import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PricingHelpers } from 'utils/PricingHelpers';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDayPipe } from '../../../shared/formatters/app-day.pipe';
import { Entity } from '../../../types/Authorization';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import PricingDefinition, { DimensionType, PricingDimension, PricingDimensions, PricingEntity, PricingRestriction, PricingStaticRestriction } from '../../../types/Pricing';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { CONNECTOR_TYPE_SELECTION_MAP } from '../../formatters/app-connector-type-selection.pipe';
import { PricingDefinitionDialogComponent } from './pricing-definition.dialog.component';

@Component({
  selector: 'app-pricing-definition',
  templateUrl: './pricing-definition.component.html',
})

export class PricingDefinitionComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: string;
  @Input() public currentEntityName: string;

  public formGroup!: FormGroup;
  public currentPricingDefinition: PricingDefinition;
  public context: string;
  // Controls general
  public id: AbstractControl;
  public name: AbstractControl;
  public description: AbstractControl;
  public entityType: AbstractControl;
  public entityID: AbstractControl;
  // Connector
  public connectorTypeMap = CONNECTOR_TYPE_SELECTION_MAP;
  public connectorPower: AbstractControl;
  // Static Restrictions
  public staticRestrictions!: FormGroup;
  public connectorType!: AbstractControl;
  public validFrom: AbstractControl;
  public validTo: AbstractControl;
  public minDate: Date;
  public minTime: string;
  public connectorPowerEnabled!: AbstractControl;
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
  public energyStepEnabled: AbstractControl;
  public energyStep: AbstractControl;
  // Charging time
  public chargingTimeDimension: FormGroup;
  public chargingTimeEnabled: AbstractControl;
  public chargingTime: AbstractControl;
  // Parking time
  public parkingTimeDimension: FormGroup;
  public parkingTimeEnabled: AbstractControl;
  public parkingTime: AbstractControl;
  // Step size
  public chargingTimeStepEnabled: AbstractControl;
  public chargingTimeStep: AbstractControl;
  public parkingTimeStepEnabled: AbstractControl;
  public parkingTimeStep: AbstractControl;
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
    this.formGroup = new FormGroup({
      id: new FormControl(),
      entityID: new FormControl(this.currentEntityID),
      entityType: new FormControl(this.currentEntityType),
      restrictions: new FormGroup({
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
      }),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      staticRestrictions: new FormGroup({
        validFrom: new FormControl(null),
        validTo: new FormControl(null),
        connectorPowerEnabled: new FormControl(false),
        connectorPowerkW: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
        connectorType: new FormControl('A',
          Validators.compose([
            Validators.required,
          ])
        ),
      }),
      description: new FormControl('', Validators.required),
      dimensions: new FormGroup({
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
      })
    });
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.entityType = this.formGroup.controls['entityType'];
    this.entityID = this.formGroup.controls['entityID'];
    // Static restrictions
    this.staticRestrictions = this.formGroup.controls['staticRestrictions'] as FormGroup;
    this.connectorPowerEnabled = this.staticRestrictions.controls['connectorPowerEnabled'];
    this.connectorPower = this.staticRestrictions.controls['connectorPowerkW'];
    this.connectorType = this.staticRestrictions.controls['connectorType'];
    this.validFrom = this.staticRestrictions.controls['validFrom'];
    this.validTo = this.staticRestrictions.controls['validTo'];
    // Dimensions
    this.dimensions = this.formGroup.controls['dimensions'] as FormGroup;
    // FlatFee
    this.flatFeeDimension = this.dimensions.controls['flatFee'] as FormGroup;
    this.flatFeeEnabled = this.flatFeeDimension.controls['active'];
    this.flatFee = this.flatFeeDimension.controls['price'];
    // Energy
    this.energyDimension = this.dimensions.controls['energy'] as FormGroup;
    this.energyEnabled = this.energyDimension.controls['active'];
    this.energy = this.energyDimension.controls['price'];
    this.energyStepEnabled = this.energyDimension.controls['stepSizeEnabled'];
    this.energyStep = this.energyDimension.controls['stepSize'];
    // ChargingTime
    this.chargingTimeDimension = this.dimensions.controls['chargingTime'] as FormGroup;
    this.chargingTimeEnabled = this.chargingTimeDimension.controls['active'];
    this.chargingTime = this.chargingTimeDimension.controls['price'];
    this.chargingTimeStepEnabled = this.chargingTimeDimension.controls['stepSizeEnabled'];
    this.chargingTimeStep = this.chargingTimeDimension.controls['stepSize'];
    // ParkingTime
    this.parkingTimeDimension = this.dimensions.controls['parkingTime'] as FormGroup;
    this.parkingTimeEnabled = this.parkingTimeDimension.controls['active'];
    this.parkingTime = this.parkingTimeDimension.controls['price'];
    this.parkingTimeStepEnabled = this.parkingTimeDimension.controls['stepSizeEnabled'];
    this.parkingTimeStep = this.parkingTimeDimension.controls['stepSize'];
    // Restrictions
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
    this.validFrom.valueChanges.subscribe(() => {
      this.minDate = this.validFrom.value;
    });
    this.timeFrom.valueChanges.subscribe(() => {
      if (this.timeTo.value && this.timeFrom.value === this.timeTo.value) {
        this.timeFrom.setErrors({timeRangeError: true});
        this.formGroup.markAsPristine();
      }
    });
    this.timeTo.valueChanges.subscribe(() => {
      if (this.timeFrom.value && this.timeFrom.value === this.timeTo.value) {
        this.timeTo.setErrors({timeRangeError: true});
        this.formGroup.markAsPristine();
      }
    });
    this.formGroup.updateValueAndValidity();
    this.loadPricing();
  }

  public loadPricing() {
    if (this.currentPricingDefinitionID) {
      this.spinnerService.show();
      this.centralServerService.getPricingDefinition(this.currentPricingDefinitionID).subscribe((currentPricingDefinition) => {
        this.spinnerService.hide();
        this.currentPricingDefinition = currentPricingDefinition;
        // Init form
        this.id.setValue(this.currentPricingDefinition.id);
        this.entityID.setValue(this.currentEntityID);
        this.entityType.setValue(this.currentEntityType);
        this.name.setValue(this.currentPricingDefinition.name);
        this.description.setValue(this.currentPricingDefinition.description);
        // Static Restrictions
        this.validFrom.setValue(this.currentPricingDefinition.staticRestrictions?.validFrom);
        this.validTo.setValue(this.currentPricingDefinition.staticRestrictions?.validTo);
        this.minDate = this.currentPricingDefinition.staticRestrictions?.validFrom;
        this.connectorType.setValue((this.currentPricingDefinition.staticRestrictions?.connectorType) || 'A');
        this.connectorPower.setValue(this.currentPricingDefinition.staticRestrictions?.connectorPowerkW);
        this.connectorPowerEnabled.setValue(!!this.connectorPower.value);
        // Dimensions
        this.initializeDimensions(this.currentPricingDefinition);
        // Restrictions
        this.daysOfWeekEnabled.setValue(!!this.currentPricingDefinition.restrictions?.daysOfWeek);
        this.selectedDays.setValue(this.currentPricingDefinition.restrictions?.daysOfWeek?.map((day) => day.toString()) || null);
        this.timeRangeEnabled.setValue(!!this.currentPricingDefinition.restrictions?.timeFrom);
        this.timeFrom.setValue(this.currentPricingDefinition.restrictions?.timeFrom);
        this.minTime = this.currentPricingDefinition.restrictions?.timeTo;
        this.timeTo.setValue(this.currentPricingDefinition.restrictions?.timeTo);
        this.minDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minDurationSecs);
        this.minDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.minDurationSecs));
        this.maxDurationEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxDurationSecs);
        this.maxDuration.setValue(PricingHelpers.toMinutes(this.currentPricingDefinition.restrictions?.maxDurationSecs));
        this.minEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minEnergyKWh);
        this.minEnergyKWh.setValue(this.currentPricingDefinition.restrictions?.minEnergyKWh);
        this.maxEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxEnergyKWh);
        this.maxEnergyKWh.setValue(this.currentPricingDefinition.restrictions?.maxEnergyKWh);
        // Force refresh the form
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('settings.pricing.pricing_definition_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'settings.pricing.pricing_definition_error');
        }
      });
    }
  }

  public closeDialog(saved = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.save.bind(this), this.closeDialog.bind(this));
  }

  public save() {
    const pricingDefinitionToSave = this.convertFormToPricingDefinition();
    if (this.currentPricingDefinitionID) {
      this.updatePricingDefinition(pricingDefinitionToSave);
    } else {
      this.createPricingDefinition(pricingDefinitionToSave);
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
      this.timeFrom.setValidators(Validators.required);
      this.timeTo.setValidators(Validators.required);
    } else {
      this.clearAndResetControl(this.timeFrom);
      this.clearAndResetControl(this.timeTo);
    }
    this.timeFrom.markAsDirty();
    this.timeTo.markAsDirty();
    this.timeFrom.updateValueAndValidity();
    this.timeTo.updateValueAndValidity();
  }

  public toggle(event: MatSlideToggleChange) {
    this[`${event.source.id}Enabled`].setValue(event.checked);
    if (event.checked) {
      this[event.source.id].setValidators(Validators.compose([
        Validators.required,
        Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
      ]));
    } else {
      this.clearAndResetControl(this[event.source.id]);
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public createPricingDefinition(pricingDefinition: PricingDefinition) {
    this.spinnerService.show();
    this.centralServerService.createPricingDefinition(pricingDefinition).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('settings.pricing.pricing_definition_creation_success');
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.pricing.pricing_definition_creation_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.pricing.pricing_definition_creation_error');
    });
  }

  public updatePricingDefinition(pricingDefinition: PricingDefinition) {
    this.spinnerService.show();
    this.centralServerService.updatePricingDefinition(pricingDefinition).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('settings.pricing.pricing_definition_update_success');
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.pricing.pricing_definition_update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.pricing.pricing_definition_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'settings.pricing.pricing_definition_update_error');
      }
    });
  }

  public refresh() {
    this.loadPricing();
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
    this[dimensionType].setValue(dimension?.price);
    if (!!dimension?.stepSize) {
      this[`${dimensionType}StepEnabled`].setValue(true);
      const stepSize = (isTimeDimension)?PricingHelpers.toMinutes(dimension?.stepSize):dimension?.stepSize;
      this[`${dimensionType}Step`].setValue(stepSize);
    }
  }

  private clearAndResetControl(control: AbstractControl) {
    control.reset();
    control.clearValidators();
    control.updateValueAndValidity();
  }

  private convertFormToPricingDefinition() {
    // Main properties
    const id: string = this.id.value;
    const entityID: string = this.entityID.value;
    const entityType: PricingEntity = this.entityType.value;
    const name: string = this.name.value;
    const description: string = this.description.value;
    // Priced Dimensions
    const dimensions: PricingDimensions = {
      flatFee: this.buildPricingDimension(DimensionType.FLAT_FEE),
      energy: this.buildPricingDimension(DimensionType.ENERGY),
      chargingTime: this.buildPricingDimension(DimensionType.CHARGING_TIME, true),
      parkingTime: this.buildPricingDimension(DimensionType.PARKING_TIME, true),
    };
    // Static restrictions
    let staticRestrictions: PricingStaticRestriction = {
      validFrom: this.validFrom.value || null,
      validTo: this.validTo.value || null,
      connectorType: (this.connectorType.value !== Constants.SELECT_ALL) ? this.connectorType.value: null,
      connectorPowerkW: (this.connectorPowerEnabled.value)? this.connectorPower.value: null
    };
    // Dynamic restrictions
    let restrictions: PricingRestriction = {
      daysOfWeek: (this.daysOfWeekEnabled.value)? this.selectedDays.value: null,
      timeFrom: (this.timeRangeEnabled.value)? this.timeFrom.value: null,
      timeTo: (this.timeRangeEnabled.value)? this.timeTo.value: null,
      minEnergyKWh: (this.minEnergyKWhEnabled.value)? this.minEnergyKWh.value: null,
      maxEnergyKWh: (this.maxEnergyKWhEnabled.value)? this.maxEnergyKWh.value: null,
      minDurationSecs: PricingHelpers.convertDurationToSeconds(this.minDurationEnabled.value, this.minDuration.value),
      maxDurationSecs: PricingHelpers.convertDurationToSeconds(this.maxDurationEnabled.value, this.maxDuration.value),
    };
    // Clear empty data for best performances server-side
    staticRestrictions = this.shrinkPricingProperties(staticRestrictions);
    restrictions = this.shrinkPricingProperties(restrictions);
    // Build the pricing definition
    const pricingDefinition: PricingDefinition = {
      id,
      entityID,
      entityType,
      name,
      description,
      dimensions,
      staticRestrictions,
      restrictions
    };
    return pricingDefinition;
  }

  private buildPricingDimension(dimensionType: DimensionType, isTimeDimension = false): PricingDimension {
    const price: number = this[dimensionType].value;
    if (price) {
      // Dimension
      const dimension: PricingDimension = {
        active: true,
        price,
      };
      const withStep: boolean = this[`${dimensionType}StepEnabled`]?.value;
      if ( withStep) {
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
    // Well ... this is strange but the backend does not accept null as dimension so far!
    return undefined;
  }

  private shrinkPricingProperties(properties: any): any  {
    for ( const propertyName in properties ) {
      if ( !properties[propertyName] ) {
        delete properties[propertyName];
      }
    }
    if ( Utils.isEmptyObject(properties)) {
      return null;
    }
    return properties;
  }
  private validateMinMax() {
    // Need one more step as we need to compare values when they are both filled
    if (this.minDuration?.value && this.maxDuration?.value) {
      if (Utils.convertToInteger(this.minDuration?.value) >= Utils.convertToInteger(this.maxDuration?.value)) {
        this.maxDuration.setErrors({minMaxError: true});
        this.formGroup.markAsPristine();
      } else {
        this.maxDuration.setErrors(null);
      }
    }
    if (this.minEnergyKWh?.value && this.maxEnergyKWh?.value) {
      if (Utils.convertToInteger(this.minEnergyKWh?.value) >= Utils.convertToInteger(this.maxEnergyKWh?.value)) {
        this.maxEnergyKWh.setErrors({minMaxError: true});
        this.formGroup.markAsPristine();
      } else {
        this.maxEnergyKWh.setErrors(null);
      }
    }
  }
}
