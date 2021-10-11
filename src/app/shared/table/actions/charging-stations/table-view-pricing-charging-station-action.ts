import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';
import { ScreenSize } from 'types/GlobalType';

import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { TableActionDef } from '../../../../types/Table';
import { TableViewPricingListAction } from '../table-pricing-action';

export interface TableViewPricingListChargingStationActionDef extends TableActionDef {
  action: (pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStation>, refresh?: () => Observable<void>) => void;
}

export class TableViewPricingListChargingStationAction extends TableViewPricingListAction {
  public getActionDef(): TableViewPricingListChargingStationActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.NAVIGATE_TO_PRICING_LIST,
      action: this.viewChargingStationPricing,
    };
  }

  private viewChargingStationPricing(pricingDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStation>, refresh?: () => Observable<void>) {
    super.view(pricingDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.XXL,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XXL,
      minHeight: ScreenSize.XXL,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XXXL
    });
  }
}