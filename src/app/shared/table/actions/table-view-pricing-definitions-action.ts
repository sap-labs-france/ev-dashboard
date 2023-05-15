import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../types/Authorization';
import { PricingButtonAction, PricingDefinitionDialogData } from '../../../types/Pricing';
import { TableActionDef } from '../../../types/Table';
import { TableViewPricingListAction } from './table-pricing-action';

export interface TableViewPricingDefinitionsActionDef extends TableActionDef {
  action: (
    pricingDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>,
    refresh?: () => Observable<void>
  ) => void;
}
export class TableViewPricingDefinitionsAction extends TableViewPricingListAction {
  public getActionDef(): TableViewPricingDefinitionsActionDef {
    return {
      ...super.getActionDef(),
      id: PricingButtonAction.VIEW_PRICING_DEFINITIONS,
      action: this.viewPricingDefinitions,
    };
  }

  private viewPricingDefinitions(
    pricingDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>,
    refresh?: () => Observable<void>
  ) {
    super.view(pricingDialogComponent, dialog, dialogParams, refresh);
  }
}
