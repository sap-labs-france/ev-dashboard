import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import PricingDefinition, { DimensionType, PricingDimension, PricingDimensions, PricingEntity, PricingRestriction, PricingStaticRestriction } from '../../../types/Pricing';
import { Constants } from '../../../utils/Constants';
import { PricingHelpers } from '../../../utils/PricingHelpers';
import { Utils } from '../../../utils/Utils';
import { PricingDefinitionDimensionsComponent } from './dimensions/pricing-definition-dimensions.component';
import { PricingDefinitionMainComponent } from './main/pricing-definition-main.component';
import { PricingDefinitionDialogComponent } from './pricing-definition.dialog.component';
import { PricingDefinitionRestricitionsComponent } from './restrictions/pricing-definition-restrictions.component';

@Component({
  selector: 'app-pricing-definition',
  templateUrl: './pricing-definition.component.html',
})

export class PricingDefinitionComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: PricingEntity;
  @Input() public currentEntityName: string;

  @ViewChild('pricingDefinitionMainComponent') public pricingDefinitionMain!: PricingDefinitionMainComponent;
  @ViewChild('pricingDefinitionRestrictionsComponent') public pricingDefinitionRestrictions!: PricingDefinitionRestricitionsComponent;
  @ViewChild('pricingDefinitionDimensionsComponent') public pricingDefinitionDimensions!: PricingDefinitionDimensionsComponent;


  public formGroup!: FormGroup;
  public currentPricingDefinition: PricingDefinition;
  public context: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    public translateService: TranslateService) {
  }

  public ngOnInit(): void {
    this.context = this.currentEntityType === PricingEntity.TENANT ? this.centralServerService.getLoggedUser().tenantName : this.currentEntityName;
    this.formGroup = new FormGroup({});
    if (this.currentPricingDefinitionID) {
      this.spinnerService.show();
      this.centralServerService.getPricingDefinition(this.currentPricingDefinitionID).subscribe((currentPricingDefinition) => {
        this.spinnerService.hide();
        this.currentPricingDefinition = currentPricingDefinition;
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
      this.translateService, this.savePricingDefinition.bind(this), this.closeDialog.bind(this));
  }

  public savePricingDefinition() {
    const pricingDefinitionToSave = this.convertFormToPricingDefinition();
    if (this.currentPricingDefinitionID) {
      this.updatePricingDefinition(pricingDefinitionToSave);
    } else {
      this.createPricingDefinition(pricingDefinitionToSave);
    }
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

  private convertFormToPricingDefinition() {
    // Main properties
    const id: string = this.pricingDefinitionMain.id.value;
    const entityID: string = this.currentEntityID;
    const entityType: PricingEntity = this.currentEntityType;
    const name: string = this.pricingDefinitionMain.name.value;
    const description: string = this.pricingDefinitionMain.description.value;
    // Priced Dimensions
    const dimensions: PricingDimensions = {
      flatFee: this.buildPricingDimension(DimensionType.FLAT_FEE),
      energy: this.buildPricingDimension(DimensionType.ENERGY),
      chargingTime: this.buildPricingDimension(DimensionType.CHARGING_TIME, true),
      parkingTime: this.buildPricingDimension(DimensionType.PARKING_TIME, true),
    };
    // Static restrictions
    let staticRestrictions: PricingStaticRestriction = {
      validFrom: this.pricingDefinitionMain.validFrom.value || null,
      validTo: this.pricingDefinitionMain.validTo.value || null,
      connectorType: (this.pricingDefinitionMain.connectorType.value !== Constants.SELECT_ALL) ? this.pricingDefinitionMain.connectorType.value: null,
      connectorPowerkW: (this.pricingDefinitionMain.connectorPowerEnabled.value)? this.pricingDefinitionMain.connectorPowerValue.value: null
    };
    // Dynamic restrictions
    let restrictions: PricingRestriction = {
      daysOfWeek: this.pricingDefinitionRestrictions.selectedDays.value || null,
      timeFrom: this.pricingDefinitionRestrictions.timeFrom.value || null,
      timeTo: this.pricingDefinitionRestrictions.timeTo.value || null,
      minEnergyKWh: this.pricingDefinitionRestrictions.minEnergyKWh.value || null,
      maxEnergyKWh: this.pricingDefinitionRestrictions.maxEnergyKWh.value || null,
      minDurationSecs: PricingHelpers.convertDurationToSeconds(this.pricingDefinitionRestrictions.minDurationEnabled.value, this.pricingDefinitionRestrictions.minDuration.value),
      maxDurationSecs: PricingHelpers.convertDurationToSeconds(this.pricingDefinitionRestrictions.maxDurationEnabled.value, this.pricingDefinitionRestrictions.maxDuration.value),
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
    const price: number = this.pricingDefinitionDimensions[dimensionType].value;
    if (price) {
      // Dimension
      const dimension: PricingDimension = {
        active: true,
        price,
      };
      const withStep: boolean = this.pricingDefinitionDimensions[`${dimensionType}StepEnabled`]?.value;
      if ( withStep) {
        let stepSize = this.pricingDefinitionDimensions[`${dimensionType}Step`]?.value;
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

}
