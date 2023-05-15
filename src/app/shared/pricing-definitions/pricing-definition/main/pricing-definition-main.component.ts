import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'utils/Utils';

import { CONNECTOR_TYPE_SELECTION_MAP } from '../../../../shared/formatters/app-connector-type-selection.pipe';
import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import PricingDefinition, { PricingStaticRestriction } from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';

@Component({
  selector: 'app-pricing-definition-main',
  templateUrl: 'pricing-definition-main.component.html',
})
export class PricingDefinitionMainComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public pricingDefinition: PricingDefinition;
  @Input() public readOnly: boolean;

  public initialized = false;

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
  public staticRestrictions!: UntypedFormGroup;
  public connectorType!: AbstractControl;
  public connectorPowerEnabled!: AbstractControl;
  public validFrom: AbstractControl;
  public validTo: AbstractControl;
  public minDate: Date;

  // eslint-disable-next-line no-useless-constructor
  public constructor(public translateService: TranslateService, public dayPipe: AppDayPipe) {}

  public ngOnInit() {
    this.formGroup.addControl('id', new UntypedFormControl());
    this.formGroup.addControl('entityID', new UntypedFormControl(''));
    this.formGroup.addControl('entityType', new UntypedFormControl(''));
    this.formGroup.addControl('name', new UntypedFormControl('', Validators.required));
    this.formGroup.addControl('description', new UntypedFormControl('', Validators.required));
    this.formGroup.addControl(
      'staticRestrictions',
      new UntypedFormGroup({
        validFrom: new UntypedFormControl(null),
        validTo: new UntypedFormControl(null),
        connectorPowerEnabled: new UntypedFormControl(false),
        connectorPowerkW: new UntypedFormControl(
          { value: null, disabled: true },
          Validators.compose([
            Validators.required,
            Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
          ])
        ),
        connectorType: new UntypedFormControl('A', Validators.required),
      })
    );
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.entityType = this.formGroup.controls['entityType'];
    this.entityID = this.formGroup.controls['entityID'];
    // Static restrictions
    this.staticRestrictions = this.formGroup.controls['staticRestrictions'] as UntypedFormGroup;
    this.connectorPowerEnabled = this.staticRestrictions.controls['connectorPowerEnabled'];
    this.connectorPowerValue = this.staticRestrictions.controls['connectorPowerkW'];
    this.connectorPowerUnit = this.staticRestrictions.controls['connectorPowerUnit'];
    this.connectorType = this.staticRestrictions.controls['connectorType'];
    this.validFrom = this.staticRestrictions.controls['validFrom'];
    this.validTo = this.staticRestrictions.controls['validTo'];
    this.validFrom.valueChanges.subscribe(() => {
      this.minDate = this.validFrom.value;
    });
    this.initialized = true;
    this.loadPricingDefinition();
  }

  public ngOnChanges() {
    this.loadPricingDefinition();
  }

  public loadPricingDefinition() {
    if (this.initialized && this.pricingDefinition) {
      // Init form
      this.id.setValue(this.pricingDefinition.id);
      this.name.setValue(this.pricingDefinition.name);
      this.description.setValue(this.pricingDefinition.description);
      // Static Restrictions
      this.validFrom.setValue(this.pricingDefinition.staticRestrictions?.validFrom);
      this.validTo.setValue(this.pricingDefinition.staticRestrictions?.validTo);
      this.minDate = this.pricingDefinition.staticRestrictions?.validFrom;
      this.connectorType.setValue(this.pricingDefinition.staticRestrictions?.connectorType || 'A');
      if (!!this.pricingDefinition.staticRestrictions?.connectorPowerkW) {
        this.connectorPowerEnabled.setValue(true);
        this.connectorPowerValue.setValue(
          this.pricingDefinition.staticRestrictions?.connectorPowerkW
        );
        this.connectorPowerValue.enable();
      }
    }
  }

  public toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this[`${event.source.id}Value`].enable();
    } else {
      this[`${event.source.id}Value`].disable();
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public buildPricingDefinitions(): PricingStaticRestriction {
    const staticRestrictions: PricingStaticRestriction = {
      validFrom: this.validFrom.value || null,
      validTo: this.validTo.value || null,
      connectorType:
        this.connectorType.value !== Constants.SELECT_ALL ? this.connectorType.value : null,
      connectorPowerkW: this.connectorPowerEnabled.value ? this.connectorPowerValue.value : null,
    };
    return Utils.shrinkObjectProperties(staticRestrictions);
  }
}
