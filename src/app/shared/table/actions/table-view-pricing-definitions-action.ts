import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../types/Authorization';
import { ScreenSize } from '../../../types/GlobalType';
import { PricingButtonAction, PricingDefinitionDialogData } from '../../../types/Pricing';
import { TableActionDef } from '../../../types/Table';
import { TableViewPricingListAction } from './table-pricing-action';

export interface TableViewPricingDefinitionsActionDef extends TableActionDef {
  action: (pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>, refresh?: () => Observable<void>) => void;
}
export class TableViewPricingDefinitionsAction extends TableViewPricingListAction {
  public getActionDef(): TableViewPricingDefinitionsActionDef {
    return {
      ...super.getActionDef(),
      id: PricingButtonAction.VIEW_PRICING_DEFINITIONS,
      action: this.viewPricingDefinitions,
    };
  }

  private viewPricingDefinitions(pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>, refresh?: () => Observable<void>) {
    super.view(pricingDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.M,
      maxHeight: ScreenSize.XL,
      height: ScreenSize.L
    });
  }
}
