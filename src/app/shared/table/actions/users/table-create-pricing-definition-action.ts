/* eslint-disable max-len */
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { PricingButtonAction, PricingDefinitionDialogData } from '../../../../types/Pricing';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreatePricingDefinitionActionDef extends TableActionDef {
  action: (
    pricingDefinitionDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableCreatePricingDefinitionAction extends TableCreateAction {
  public getActionDef(): TableCreatePricingDefinitionActionDef {
    return {
      ...super.getActionDef(),
      id: PricingButtonAction.CREATE_PRICING_DEFINITION,
      action: this.createPricing,
    };
  }

  private createPricing(
    pricingDefinitionDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>,
    refresh?: () => Observable<void>
  ) {
    super.create(pricingDefinitionDialogComponent, dialog, dialogParams, refresh);
  }
}
