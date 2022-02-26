import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewChargingStationActionDef extends TableActionDef {
  action: (chargingStationDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStation>, refresh?: () => Observable<void>) => void;
}

export class TableViewChargingStationAction extends TableViewAction {
  public getActionDef(): TableViewChargingStationActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.VIEW_CHARGING_STATION,
      action: this.viewChargingStation,
    };
  }

  private viewChargingStation(chargingStationDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStation>, refresh?: () => Observable<void>) {
    super.view(chargingStationDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.XL,
      maxWidth: ScreenSize.XL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.XL,
      maxHeight: ScreenSize.XL,
      height: ScreenSize.XL
    });
  }
}
