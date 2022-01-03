import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppDayPipe } from 'shared/formatters/app-day.pipe';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Entity } from '../../../types/Authorization';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import PricingDefinition, { PricingDimensions, PricingRestriction } from '../../../types/Pricing';
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
  public connectorPowerValue: AbstractControl;
  public connectorPowerUnit: AbstractControl;
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
  public dimensionsMap: PricingDimensions;
  public dimensionsKeys: string[];
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
  // Restrictions
  public restrictions!: FormGroup;
  public restrictionsMap: PricingRestriction;
  public restrictionsKeys: string[];
  // Duration
  public minDurationSecsEnabled: AbstractControl;
  public minDurationSecsValue: AbstractControl;
  public maxDurationSecsEnabled: AbstractControl;
  public maxDurationSecsValue: AbstractControl;
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
  public timeFromEnabled: AbstractControl;
  public timeToEnabled: AbstractControl;
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
    this.formGroup = new FormGroup({
      id: new FormControl(),
      entityID: new FormControl(this.currentEntityID),
      entityType: new FormControl(this.currentEntityType),
      restrictions: new FormGroup({
        minDurationSecsEnabled: new FormControl(false),
        minDurationSecs: new FormControl(null, Validators.compose([
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        maxDurationSecsEnabled: new FormControl(false),
        maxDurationSecs: new FormControl(null, Validators.compose([
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        minEnergyKWhEnabled: new FormControl(false),
        minEnergyKWh: new FormControl(null, Validators.compose([
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        maxEnergyKWhEnabled: new FormControl(false),
        maxEnergyKWh: new FormControl(null, Validators.compose([
          Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)
        ])),
        timeFromEnabled: new FormControl(false),
        timeFrom: new FormControl(null),
        timeToEnabled: new FormControl(false),
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
      description: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      dimensions: new FormGroup({
        flatFee: new FormGroup({
          active: new FormControl(false),
          price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
        }),
        energy: new FormGroup({
          active: new FormControl(false),
          price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
          stepSize: new FormControl(null),
          stepSizeEnabled: new FormControl(false)
        }),
        chargingTime: new FormGroup({
          active: new FormControl(false),
          price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
          stepSize: new FormControl(null),
          stepSizeEnabled: new FormControl(false)
        }),
        parkingTime: new FormGroup({
          active: new FormControl(false),
          price: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
          stepSize: new FormControl(null),
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
    this.connectorPowerValue = this.staticRestrictions.controls['connectorPowerkW'];
    this.connectorPowerUnit = this.staticRestrictions.controls['connectorPowerUnit'];
    this.connectorType = this.staticRestrictions.controls['connectorType'];
    this.validFrom = this.staticRestrictions.controls['validFrom'];
    this.validTo = this.staticRestrictions.controls['validTo'];
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
    this.restrictions = this.formGroup.controls['restrictions'] as FormGroup;
    this.minDurationSecsEnabled = this.restrictions.controls['minDurationSecsEnabled'];
    this.minDurationSecsValue = this.restrictions.controls['minDurationSecs'];
    this.maxDurationSecsEnabled = this.restrictions.controls['maxDurationSecsEnabled'];
    this.maxDurationSecsValue = this.restrictions.controls['maxDurationSecs'];
    this.minEnergyKWhEnabled = this.restrictions.controls['minEnergyKWhEnabled'];
    this.minEnergyKWhValue = this.restrictions.controls['minEnergyKWh'];
    this.maxEnergyKWhEnabled = this.restrictions.controls['maxEnergyKWhEnabled'];
    this.maxEnergyKWhValue = this.restrictions.controls['maxEnergyKWh'];
    this.daysOfWeekEnabled = this.restrictions.controls['daysOfWeekEnabled'];
    this.selectedDays = this.restrictions.controls['selectedDays'];
    this.timeFromEnabled = this.restrictions.controls['timeFromEnabled'];
    this.timeToEnabled = this.restrictions.controls['timeToEnabled'];
    this.timeFromValue = this.restrictions.controls['timeFrom'];
    this.timeToValue = this.restrictions.controls['timeTo'];
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
        this.validFrom.setValue(this.currentPricingDefinition.staticRestrictions?.validFrom);
        this.validTo.setValue(this.currentPricingDefinition.staticRestrictions?.validTo);
        this.minDate = this.currentPricingDefinition.staticRestrictions?.validFrom;
        this.connectorType.setValue((this.currentPricingDefinition.staticRestrictions?.connectorType) || 'A');
        this.connectorPowerValue.setValue(this.currentPricingDefinition.staticRestrictions?.connectorPowerkW);
        this.connectorPowerEnabled.setValue(!!this.connectorPowerValue.value);
        this.dimensionsMap = currentPricingDefinition.dimensions;
        this.dimensionsKeys = Object.keys(this.dimensionsMap);
        this.initializeDimensions();
        this.restrictionsMap = currentPricingDefinition.restrictions;
        this.restrictionsKeys = Object.keys(this.restrictionsMap);
        this.daysOfWeekEnabled.setValue(!!this.currentPricingDefinition.restrictions?.daysOfWeek);
        this.selectedDays.setValue(this.currentPricingDefinition.restrictions?.daysOfWeek?.map((day) => day.toString()) || null);
        this.timeFromEnabled.setValue(!!this.currentPricingDefinition.restrictions?.timeFrom);
        this.timeFromValue.setValue(this.currentPricingDefinition.restrictions?.timeFrom);
        this.minTime = this.currentPricingDefinition.restrictions?.timeTo;
        this.timeToValue.setValue(this.currentPricingDefinition.restrictions?.timeTo);
        this.minDurationSecsEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minDurationSecs);
        this.minDurationSecsValue.setValue(this.currentPricingDefinition.restrictions?.minDurationSecs);
        this.maxDurationSecsEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxDurationSecs);
        this.maxDurationSecsValue.setValue(this.currentPricingDefinition.restrictions?.maxDurationSecs);
        this.minEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.minEnergyKWh);
        this.minEnergyKWhValue.setValue(this.currentPricingDefinition.restrictions?.minEnergyKWh);
        this.maxEnergyKWhEnabled.setValue(!!this.currentPricingDefinition.restrictions?.maxEnergyKWh);
        this.maxEnergyKWhValue.setValue(this.currentPricingDefinition.restrictions?.maxEnergyKWh);
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

  public save(pricingDefinition: PricingDefinition) {
    if (this.checkPricingDefinition(pricingDefinition)) {
      if (this.currentPricingDefinitionID) {
        this.updatePricingDefinition(pricingDefinition);
      } else {
        this.createPricingDefinition(pricingDefinition);
      }
    }
  }

  public toggle(event) {
    this[`${event.source.id}Enabled`].setValue(event.checked);
    if (event.checked) {
      switch (event.source.id) {
        case 'timeFrom':
          this.timeFromValue.setValidators(Validators.compose([
            Validators.required,
            // Validators.pattern('^[0-9]{2}:[0-9]{2} (AM|PM)$')
          ]));
          this.timeToValue.setValidators(Validators.compose([
            Validators.required,
            // Validators.pattern('^[0-9]{2}:[0-9]{2} (AM|PM)$')
          ]));
          break;
        case 'daysOfWeek':
          this.selectedDays.setValidators(Validators.required);
          break;
        default:
          this[`${event.source.id}Value`].setValidators(Validators.compose([
            Validators.required,
            Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)
          ]));
      }
    } else {
      switch (event.source.id) {
        case 'timeFrom':
          this.clearAndResetControl(this.timeFromValue);
          this.clearAndResetControl(this.timeToValue);
          break;
        case 'daysOfWeek':
          this.clearAndResetControl(this.selectedDays);
          break;
        default:
          this.clearAndResetControl(this[`${event.source.id}Value`]);
      }
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

  private initializeDimensions() {
    for (const dimensionKey of this.dimensionsKeys) {
      this[`${dimensionKey}Enabled`].setValue(this.dimensionsMap[dimensionKey].active);
      this[`${dimensionKey}Value`].setValue(this.dimensionsMap[dimensionKey].price);
      if (!!this.dimensionsMap[dimensionKey].stepSize) {
        this[`${dimensionKey}StepEnabled`].setValue(true);
        this[`${dimensionKey}StepValue`].setValue(this.dimensionsMap[dimensionKey].stepSize);
      }
    }
  }

  private clearAndResetControl(control: AbstractControl) {
    control.reset();
    control.clearValidators();
    control.updateValueAndValidity();
  }

  private checkPricingDefinition(pricingDefinition: PricingDefinition) {
    if (this.timeFromEnabled.value) {
      if (this.timeToValue.value === this.timeFromValue.value) {
        this.messageService.showErrorMessage('settings.pricing.pricing_definition_time_error');
        this.timeToValue.setErrors({incorrectEndTime: true});
        this.timeToValue.markAsPristine();
        return false;
      }
    }
    if (!this.connectorPowerEnabled.value) {
      delete pricingDefinition.staticRestrictions.connectorPowerkW;
    }
    if (!this.parkingTimeEnabled.value || !this.parkingTimeStepEnabled.value) {
      delete pricingDefinition.dimensions.parkingTime.stepSize;
    }
    if (!this.chargingTimeEnabled.value || !this.chargingTimeStepEnabled.value) {
      delete pricingDefinition.dimensions.chargingTime.stepSize;
    }
    if (!this.energyEnabled.value || !this.energyStepEnabled.value) {
      delete pricingDefinition.dimensions.energy.stepSize;
    }
    for (const dimensionKey in pricingDefinition.dimensions) {
      if (!pricingDefinition.dimensions[dimensionKey].active) {
        delete pricingDefinition.dimensions[dimensionKey].price;
      }
    }
    if (this.daysOfWeekEnabled.value) {
      pricingDefinition.restrictions.daysOfWeek = this.selectedDays.value;
    }
    if (!this.timeFromEnabled) {
      delete pricingDefinition.restrictions.timeFrom;
      delete pricingDefinition.restrictions.timeTo;
    }
    for (const restrictionKey in pricingDefinition.restrictions) {
      if (!pricingDefinition.restrictions[`${restrictionKey}`]) {
        delete pricingDefinition.restrictions[restrictionKey];
      }
    }
    if (this.connectorType.value === Constants.SELECT_ALL) {
      pricingDefinition.staticRestrictions.connectorType = null;
    }
    return true;
  }
}
