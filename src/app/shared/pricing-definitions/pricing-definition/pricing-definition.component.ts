/* eslint-disable max-len */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AbstractTabComponent } from '../../../shared/component/abstract-tab/abstract-tab.component';
import { DialogMode } from '../../../types/Authorization';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import PricingDefinition, { PricingEntity } from '../../../types/Pricing';
import { Utils } from '../../../utils/Utils';
import { PricingDefinitionDimensionsComponent } from './dimensions/pricing-definition-dimensions.component';
import { PricingDefinitionMainComponent } from './main/pricing-definition-main.component';
import { PricingDefinitionDialogComponent } from './pricing-definition.dialog.component';
import { PricingDefinitionRestrictionsComponent } from './restrictions/pricing-definition-restrictions.component';

@Component({
  selector: 'app-pricing-definition',
  templateUrl: './pricing-definition.component.html',
})
export class PricingDefinitionComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentPricingDefinitionID!: string;
  @Input() public currentEntityID!: string;
  @Input() public currentEntityType!: PricingEntity;
  @Input() public currentEntityName: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<PricingDefinitionDialogComponent>;

  @ViewChild('pricingDefinitionMainComponent') public pricingDefinitionMain!: PricingDefinitionMainComponent;
  @ViewChild('pricingDefinitionRestrictionsComponent') public pricingDefinitionRestrictions!: PricingDefinitionRestrictionsComponent;
  @ViewChild('pricingDefinitionDimensionsComponent') public pricingDefinitionDimensions!: PricingDefinitionDimensionsComponent;

  public formGroup!: FormGroup;
  public readOnly = true;
  public pricingDefinition: PricingDefinition;
  public context: string;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    public translateService: TranslateService,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService) {
    super(activatedRoute, windowService, ['main', 'dimensions', 'restrictions'], false);
  }

  public ngOnInit(): void {
    this.context = this.currentEntityType === PricingEntity.TENANT ? this.centralServerService.getLoggedUser().tenantName : this.currentEntityName;
    this.formGroup = new FormGroup({});
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    if (this.currentPricingDefinitionID) {
      this.loadPricingDefinition();
    } else if (this.activatedRoute?.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentPricingDefinitionID = params['id'];
        this.loadPricingDefinition();
      });
    }
    // Handle Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadPricingDefinition() {
    if (this.currentPricingDefinitionID) {
      this.spinnerService.show();
      this.centralServerService.getPricingDefinition(this.currentPricingDefinitionID).subscribe((currentPricingDefinition) => {
        this.spinnerService.hide();
        this.pricingDefinition = currentPricingDefinition;
        // Update form group
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('sites.pricing_definition_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      });
    }
  }

  public closeDialog(saved = false) {
    if (this.dialogRef) {
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
    const dimensions = this.pricingDefinitionDimensions.buildPricingDimensions();
    // Static restrictions
    const staticRestrictions = this.pricingDefinitionMain.buildPricingDefinitions();
    // Dynamic restrictions
    const restrictions = this.pricingDefinitionRestrictions.buildPrincingRestrictions();
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
}
