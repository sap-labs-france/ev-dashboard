import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { CONNECTOR_TYPE_SELECTION_MAP } from 'shared/formatters/app-connector-type-selection.pipe';

import { CentralServerService } from '../../../../services/central-server.service';
import { AppDayPipe } from '../../../../shared/formatters/app-day.pipe';
import { Entity } from '../../../../types/Authorization';
import PricingDefinition, {  } from '../../../../types/Pricing';
import { Constants } from '../../../../utils/Constants';
import { PricingDefinitionDialogComponent } from './../pricing-definition.dialog.component';

@Component({
  selector: 'app-pricing-definition-main',
  templateUrl: './pricing-definition-main.component.html',
})

export class PricingDefinitionMainComponent implements OnInit, OnChanges {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: string;
  @Input() public currentEntityName: string;
  @Input() public pricingDefinition: PricingDefinition;
  @Input() public formGroup!: FormGroup;
  @Input() public currentPricingDefinition: PricingDefinition;

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

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    public translateService: TranslateService,
    public dayPipe: AppDayPipe) {
  }

  public ngOnInit(): void {
    this.context = this.currentEntityType === Entity.TENANT ? this.centralServerService.getLoggedUser().tenantName : this.currentEntityName;
    this.formGroup.addControl('id', new FormControl());
    this.formGroup.addControl('entityID', new FormControl(this.currentEntityID));
    this.formGroup.addControl('entityType', new FormControl(this.currentEntityType));
    this.formGroup.addControl('name', new FormControl('', Validators.required));
    this.formGroup.addControl('description', new FormControl('', Validators.required));
    this.formGroup.addControl('staticRestrictions', new FormGroup({
      validFrom: new FormControl(null),
      validTo: new FormControl(null),
      connectorPowerEnabled: new FormControl(false),
      connectorPowerkW: new FormControl(null, Validators.pattern(Constants.REGEX_VALIDATION_FLOAT)),
      connectorType: new FormControl('A',
        Validators.compose([
          Validators.required,
        ])
      ),
    }));
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
    this.validFrom.valueChanges.subscribe(() => {
      this.minDate = this.validFrom.value;
    });
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadPricing();
  }

  public loadPricing() {
    if (this.currentPricingDefinition) {
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
      this.connectorPowerValue.setValue(this.currentPricingDefinition.staticRestrictions?.connectorPowerkW);
      this.connectorPowerEnabled.setValue(!!this.connectorPowerValue.value);
      // Force refresh the form
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
    }
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
