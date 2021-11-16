import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../types/Authorization';
import { ScreenSize } from '../../../types/GlobalType';
import { PricingButton, PricingDefinitionDialogData } from '../../../types/Pricing';
import { TableActionDef } from '../../../types/Table';
import { TableViewPricingListAction } from './table-pricing-action';

export interface TableViewPricingsActionDef extends TableActionDef {
  action: (pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>, refresh?: () => Observable<void>) => void;
}
export class TableViewPricingsAction extends TableViewPricingListAction {
  public getActionDef(): TableViewPricingsActionDef {
    return {
      ...super.getActionDef(),
      id: PricingButton.VIEW_PRICING_LIST,
      action: this.viewPricings,
    };
  }

  private viewPricings(pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<PricingDefinitionDialogData>, refresh?: () => Observable<void>) {
    super.view(pricingDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.M,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.L
    });
  }
}
