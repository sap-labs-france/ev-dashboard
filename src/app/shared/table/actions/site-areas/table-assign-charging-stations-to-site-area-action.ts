import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogMode, DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableAssignChargingStationsToSiteAreaActionDef extends TableActionDef {
  action: (siteAreaChargingStationsDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<SiteArea>, refresh?: () => Observable<void>) => void;
}

export class TableAssignChargingStationsToSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableAssignChargingStationsToSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA,
      icon: 'ev_station',
      name: 'general.edit',
      tooltip: 'general.tooltips.edit_chargers',
      action: this.assignChargingStationsToSiteArea,
    };
  }

  private assignChargingStationsToSiteArea(siteAreaChargingStationsDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<SiteArea>, refresh?: () => Observable<void>) {
    super.assign(siteAreaChargingStationsDialogComponent, dialog, dialogParams, DialogMode.EDIT, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XL
    });
  }
}
